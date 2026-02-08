import { computed } from "vue";
import { ERRORS_LOGIN, type UserDto } from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";
import {
  maskEmail,
  getErrorMessage2FA,
  isValidPassword,
  createAuthState,
} from "@vao/shared-ui/utils/auth";
import type {
  UseAuthenticationReturn,
  LoginResponse,
  Verify2FAResponse,
  Verify2FAPayload,
  ApiError,
  LoginErrorType,
  ApiEndpoints,
} from "@vao/shared-ui/types/Auth.type";

export const useAuthenticationBO = (): UseAuthenticationReturn => {
  const config = useRuntimeConfig();
  const toaster = useToaster();
  const userStore = useUserStore();
  const log = logger("composables/useAuthenticationBO");

  const state = createAuthState();
  const {
    email,
    password,
    displayType,
    openTwoFactor,
    openCgu,
    isLoggingIn,
    isVerifying2FA,
    isResendingCode,
  } = state;

  const API: ApiEndpoints = {
    LOGIN: "/bo-authentication/email/login",
    VERIFY_2FA: "/bo-authentication/verify-2fa",
    RESEND_2FA: "/bo-authentication/resend-2fa",
    ACCEPT_CGU: "/bo-user/accept-cgu",
  };

  const canLogin = computed<boolean>(() => {
    return (
      email.value !== null &&
      email.value !== "" &&
      password.value !== null &&
      isValidPassword(password.value)
    );
  });

  const maskedEmail = computed<string>(() => {
    if (!email.value) return "";
    return maskEmail(email.value);
  });

  function calculateServiceCompetent(
    territoireCode: string,
  ): "NAT" | "DEP" | "REG" {
    if (territoireCode === "FRA") {
      return "NAT";
    }
    if (/^\d+$/.test(territoireCode)) {
      return "DEP";
    }
    return "REG";
  }

  function processUserData(user: UserDto): UserDto {
    const serviceCompetent = calculateServiceCompetent(
      user.territoireCode || "",
    );
    return {
      ...user,
      territoireCode: user.territoireCode || "",
      serviceCompetent,
    };
  }

  async function continueAuthenticationFlow(user: UserDto): Promise<void> {
    const processedUser = processUserData(user);
    userStore.user = processedUser;

    // Pas de store organisme pour le BO

    if (user?.cguAccepted === false) {
      openCgu.value = true;
    } else {
      toaster.success({
        titleTag: "h2",
        description: "Authentification réalisée avec succès",
      });
      displayType.value = null;
      navigateTo("/");
    }
  }

  async function login(): Promise<void> {
    log.i("login", { email: email.value });

    if (!canLogin.value) {
      log.w("login - impossible, formulaire incomplet");
      return;
    }

    isLoggingIn.value = true;
    displayType.value = null;

    try {
      const response = await $fetch<LoginResponse>(
        config.public.backendUrl + API.LOGIN,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: email.value,
            password: password.value,
          },
        },
      );

      if (response.requires2FA) {
        log.i("login - 2FA requis, navigation vers page dédiée BO");

        if (typeof window !== "undefined") {
          sessionStorage.setItem("2fa-email-bo", email.value);
        }

        if (response.twoFactorExpiration) {
            sessionStorage.setItem("2fa-expiration-bo", response.twoFactorExpiration);
        }

        navigateTo("/connexion/verification-2fa");
        return;
      }

      log.i("login - succès sans 2FA");
      await continueAuthenticationFlow(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      const codeError = apiError?.data?.name as LoginErrorType | undefined;
      log.w("login - erreur", {
        error: codeError ?? apiError?.data ?? apiError,
      });

      switch (codeError) {
        case ERRORS_LOGIN.TooManyLoginAttempts:
          displayType.value = ERRORS_LOGIN.TooManyLoginAttempts;
          break;
        case ERRORS_LOGIN.WrongCredentials:
        case ERRORS_LOGIN.EmailUnauthorized:
        case ERRORS_LOGIN.UserTemporarilyBlocked:
          displayType.value = ERRORS_LOGIN.WrongCredentials;
          break;
        case ERRORS_LOGIN.NeedEmailValidation:
          displayType.value = ERRORS_LOGIN.NeedEmailValidation;
          break;
        default:
          displayType.value = ERRORS_LOGIN.UnexpectedError;
          break;
      }

      toaster.error({
        titleTag: "h2",
        description: "Échec de l'authentification",
      });
    } finally {
      isLoggingIn.value = false;
    }
  }

  async function verify2FACode(payload: Verify2FAPayload): Promise<void> {
    const { code, rememberDevice } = payload;
    log.i("verify2FACode", { codeLength: code?.length, rememberDevice });

    isVerifying2FA.value = true;

    try {
      const response = await $fetch<Verify2FAResponse>(
        config.public.backendUrl + API.VERIFY_2FA,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: { code, rememberDevice },
        },
      );

      log.i("verify2FACode - succès");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("2fa-email-bo");
      }

      await continueAuthenticationFlow(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      const codeError = apiError?.data?.name;
      log.w("verify2FACode - erreur", { error: codeError ?? apiError });

      throw {
        type: "error",
        title: "Code invalide",
        description: getErrorMessage2FA(codeError),
      };
    } finally {
      isVerifying2FA.value = false;
    }
  }

  async function resendCode(): Promise<void> {
    log.i("resendCode");

    isResendingCode.value = true;

    try {
      await $fetch(config.public.backendUrl + API.RESEND_2FA, {
        credentials: "include",
        method: "POST",
      });

      log.i("resendCode - succès");

      toaster.success({
        description: "Un nouveau code a été envoyé à votre adresse email",
      });
    } catch (error) {
      log.w("resendCode - erreur", { error });

      toaster.error({
        description: "Impossible de renvoyer le code. Veuillez réessayer.",
      });

      throw error;
    } finally {
      isResendingCode.value = false;
    }
  }

  function cancel2FA(): void {
    log.i("cancel2FA");
  }

  async function validateCgu(): Promise<void> {
    log.i("validateCgu");

    try {
      await $fetch(config.public.backendUrl + API.ACCEPT_CGU, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      openCgu.value = false;

      toaster.success({
        description: "CGU acceptées avec succès",
      });

      navigateTo("/");
    } catch (error) {
      log.w("validateCgu - erreur", { error });

      toaster.error({
        description: "Erreur lors de l'acceptation des CGU",
      });
    }
  }

  function refuseCgu(): void {
    log.i("refuseCgu");
    openCgu.value = false;
    navigateTo("/bo/connexion");
  }

  function reset(): void {
    email.value = "";
    password.value = "";
    displayType.value = null;
    openTwoFactor.value = false;
    openCgu.value = false;
    isLoggingIn.value = false;
    isVerifying2FA.value = false;
  }

  return {
    email,
    password,
    displayType,
    openTwoFactor,
    openCgu,
    isLoggingIn,
    isVerifying2FA,
    isResendingCode,

    canLogin,
    maskedEmail,

    login,

    verify2FACode,
    resendCode,
    cancel2FA,

    validateCgu,
    refuseCgu,

    reset,
  };
};
