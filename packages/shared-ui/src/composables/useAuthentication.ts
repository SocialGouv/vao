import { computed } from "vue";
import { $fetch } from "ofetch";
import { ERRORS_LOGIN, USER_COMPETENCE_BO } from "@vao/shared-bridge";
import type { UserDto, TwoFactorErrorCode } from "@vao/shared-bridge";
import { useToaster } from "../composables/useToaster";
import createLogger from "../utils/createLogger";
import {
  maskEmail,
  getErrorMessage2FA,
  isValidPassword,
  createAuthState,
} from "../utils/auth";
import type {
  UseAuthenticationReturn,
  LoginResponse,
  Verify2FAResponse,
  Verify2FAPayload,
  ApiError,
  LoginErrorType,
  ApiEndpoints,
} from "../types/Auth.type";

type AuthType = "fo" | "bo";

interface IUserStore {
  user: UserDto | null;
  refreshProfile: () => Promise<void>;
}
interface IOrganismeStore {
  setMyOrganisme: () => Promise<void>;
}

interface AuthConfig {
  endpoints: ApiEndpoints;
  sessionStorageKey: string;
  expirationKey: string;
  route2FA: string;
  routeLogin: string;
  useOrganismeStore: boolean;
  useRefreshProfile: boolean;
  /** Calculer serviceCompetent (BO uniquement) */
  calculateServiceCompetent: boolean;
  /** Gérer erreur NeedSiretValidation (FO uniquement) */
  handleSiretValidation: boolean;
}

function getAuthConfig(type: AuthType): AuthConfig {
  if (type === "bo") {
    return {
      endpoints: {
        LOGIN: "/bo-authentication/email/login",
        VERIFY_2FA: "/bo-authentication/verify-2fa",
        RESEND_2FA: "/bo-authentication/resend-2fa",
        ACCEPT_CGU: "/bo-user/accept-cgu",
      },
      sessionStorageKey: "2fa-email-bo",
      expirationKey: "2fa-expiration-bo",
      route2FA: "/connexion/verification-2fa",
      routeLogin: "/connexion",
      useOrganismeStore: false,
      useRefreshProfile: false,
      calculateServiceCompetent: true,
      handleSiretValidation: false,
    };
  }

  return {
    endpoints: {
      LOGIN: "/authentication/email/login",
      VERIFY_2FA: "/authentication/verify-2fa",
      RESEND_2FA: "/authentication/resend-2fa",
      ACCEPT_CGU: "/fo-user/accept-cgu",
    },
    sessionStorageKey: "2fa-email",
    expirationKey: "2fa-expiration",
    route2FA: "/connexion/verification-2fa",
    routeLogin: "/connexion",
    useOrganismeStore: true,
    useRefreshProfile: true,
    calculateServiceCompetent: false,
    handleSiretValidation: true,
  };
}

export const useAuthentication = (
  type: AuthType,
  backendUrl: string,
  userStore: IUserStore,
  navigateTo?: (route: string) => void,
  organismeStore?: IOrganismeStore,
): UseAuthenticationReturn => {
  const toaster = useToaster();
  const logger = createLogger("vao-shared-ui");
  const log = logger(`composables/useAuthentication-${type.toUpperCase()}`);

  const authConfig = getAuthConfig(type);
  const API = authConfig.endpoints;

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

  function calculateServiceCompetent(territoireCode: string) {
    if (territoireCode === "FRA") {
      return USER_COMPETENCE_BO.NATIONALE;
    }
    if (/^\d+$/.test(territoireCode)) {
      return USER_COMPETENCE_BO.DEPARTEMENTALE;
    }
    return USER_COMPETENCE_BO.REGIONALE;
  }

  function processUserData(user: UserDto): UserDto {
    if (!authConfig.calculateServiceCompetent) {
      return user;
    }

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

    if (authConfig.useOrganismeStore && organismeStore) {
      await organismeStore.setMyOrganisme();
    }

    if (authConfig.useRefreshProfile) {
      await userStore.refreshProfile();
    }

    if (user?.cguAccepted === false) {
      openCgu.value = true;
    } else {
      toaster.success({
        titleTag: "h2",
        description: "Authentification réalisée avec succès",
      });
      displayType.value = null;
      if (navigateTo) {
        navigateTo("/");
      }
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
      const response = await $fetch<LoginResponse>(backendUrl + API.LOGIN, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: email.value,
          password: password.value,
        },
      });

      // response.requires2FA = true; // Forcer 2FA pour les tests

      if (response.requires2FA) {
        log.i("login - 2FA requis, navigation vers page dédiée");

        if (typeof window !== "undefined") {
          sessionStorage.setItem(authConfig.sessionStorageKey, email.value);

          if (response.twoFactorExpiration) {
            sessionStorage.setItem(
              authConfig.expirationKey,
              response.twoFactorExpiration,
            );
            log.i("login - expiration stockée", {
              expiration: response.twoFactorExpiration,
            });
          }
        }

        if (navigateTo) {
          navigateTo(authConfig.route2FA);
        }
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
        // NeedSiretValidation : FO uniquement
        case ERRORS_LOGIN.NeedSiretValidation:
          if (authConfig.handleSiretValidation) {
            displayType.value = ERRORS_LOGIN.NeedSiretValidation;
          } else {
            displayType.value = ERRORS_LOGIN.UnexpectedError;
          }
          break;
        default:
          displayType.value = ERRORS_LOGIN.UnexpectedError;
          break;
      }

      toaster.error({
        titleTag: "h2",
        role: "alert",
        description: "Échec de l'authentification",
      });
    } finally {
      isLoggingIn.value = false;
    }
  }

  async function verify2FACode(payload: Verify2FAPayload): Promise<void> {
    console.log("verify2FACode", { payload }); // Garder ce log pour le debug, à supprimer si trop verbeux
    const { code, rememberDevice } = payload;
    log.i("verify2FACode", { codeLength: code?.length, rememberDevice });

    isVerifying2FA.value = true;

    try {
      const response = await $fetch<Verify2FAResponse>(
        backendUrl + API.VERIFY_2FA,
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
        sessionStorage.removeItem(authConfig.sessionStorageKey);
        sessionStorage.removeItem(authConfig.expirationKey);
      }

      await continueAuthenticationFlow(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      const codeError = apiError?.data?.name as TwoFactorErrorCode | undefined;
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
      await $fetch(backendUrl + API.RESEND_2FA, {
        credentials: "include",
        method: "POST",
      });

      log.i("resendCode - succès");

      toaster.success({
        description: "Un nouveau code a été envoyé à votre adresse e-mail",
      });
    } catch (error) {
      log.w("resendCode - erreur", { error });

      toaster.error({
        description: "Impossible de renvoyer le code. Veuillez réessayer.",
        role: "alert",
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
      await $fetch(backendUrl + API.ACCEPT_CGU, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      openCgu.value = false;

      // Appels spécifiques FO
      if (authConfig.useOrganismeStore && organismeStore) {
        await organismeStore.setMyOrganisme();
      }

      if (authConfig.useRefreshProfile) {
        await userStore.refreshProfile();
      }

      toaster.success({
        description: "CGU acceptées avec succès",
      });

      if (navigateTo) {
        navigateTo("/");
      }
    } catch (error) {
      log.w("validateCgu - erreur", { error });

      toaster.error({
        description: "Erreur lors de l'acceptation des CGU",
        role: "alert",
      });
    }
  }

  function refuseCgu(): void {
    log.i("refuseCgu");
    openCgu.value = false;
    if (navigateTo) {
      navigateTo(authConfig.routeLogin);
    }
  }

  function reset(): void {
    email.value = "";
    password.value = "";
    displayType.value = null;
    openTwoFactor.value = false;
    openCgu.value = false;
    isLoggingIn.value = false;
    isVerifying2FA.value = false;
    isResendingCode.value = false;
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
