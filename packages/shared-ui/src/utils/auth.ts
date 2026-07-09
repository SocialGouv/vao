import { ref } from "vue";
import type { AuthState, LoginErrorType } from "../types/Auth.type";
import { emailRegex } from "./regex";
import { TwoFactorErrorCode, addMinutes } from "@vao/shared-bridge";

export function maskEmail(emailAddress: string): string {
  if (!emailAddress || !emailAddress.includes("@")) return emailAddress;

  const [local, domain] = emailAddress.split("@");
  const domainParts = domain.split(".");
  const extension = domainParts.pop();

  return `${local[0]}***@${domainParts[0][0]}***.${extension}`;
}

export function getErrorMessage2FA(
  errorCode?: TwoFactorErrorCode | string,
): string {
  const messages: Record<string, string> = {
    [TwoFactorErrorCode.INVALID_CODE]:
      "Le code saisi est incorrect. Veuillez réessayer.",
    [TwoFactorErrorCode.EXPIRED_CODE]:
      "Ce code a expiré. Veuillez en demander un nouveau.",
    [TwoFactorErrorCode.TOO_MANY_ATTEMPTS]:
      "Trop de tentatives. Veuillez attendre avant de réessayer.",
    [TwoFactorErrorCode.CODE_ALREADY_USED]: "Ce code a déjà été utilisé.",
  };

  return (
    messages[errorCode || ""] || "Une erreur est survenue. Veuillez réessayer."
  );
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password !== null && password !== "" && password !== undefined;
}

export function createAuthState(): AuthState {
  return {
    emailError: ref<string | null>(null),
    passwordError: ref<string | null>(null),
    email: ref<string>(""),
    password: ref<string>(""),
    displayType: ref<LoginErrorType | null>(null),
    openTwoFactor: ref<boolean>(false),
    isLoggingIn: ref<boolean>(false),
    isVerifying2FA: ref<boolean>(false),
    isResendingCode: ref<boolean>(false),
    submitAttempt: ref<number>(0),
  };
}

export function otpUnlockAt(
  otpAttemptsAt: string | null | undefined,
): string | null {
  if (
    otpAttemptsAt === "null" ||
    otpAttemptsAt === undefined ||
    otpAttemptsAt === "undefined"
  ) {
    return null;
  } else {
    return (
      addMinutes(new Date(otpAttemptsAt ?? new Date()), 15)?.toISOString() ??
      null
    );
  }
}

export function getEmailError(email: string): string | null {
  if (!email)
    return "Le champ « Identifiant » est vide. Veuillez renseigner votre adresse courriel. Exemple : nom@domaine.fr";
  if (!isValidEmail(email))
    return "Le champ « Identifiant » est invalide. Merci de saisir une adresse au format nom@domaine.fr";
  return null;
}

export function getPasswordError(password: string): string | null {
  if (!isValidPassword(password))
    return "Le champ « Mot de passe » est vide. Veuillez renseigner votre mot de passe.";
  return null;
}
