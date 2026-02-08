import { ref } from "vue";
import type {
  AuthState,
  LoginErrorType,
  TwoFactorErrorType,
} from "../types/Auth.type";
import { emailRegex } from "./regex";

/**
 * Helpers partagés pour l'authentification FO et BO
 * Extrait les fonctions communes sans créer de dépendances
 */

/**
 * Masque un email : exemple@domain.com → e***@d***.com
 */
export function maskEmail(emailAddress: string): string {
  if (!emailAddress || !emailAddress.includes("@")) return emailAddress;

  const [local, domain] = emailAddress.split("@");
  const domainParts = domain.split(".");
  const extension = domainParts.pop();

  return `${local[0]}***@${domainParts[0][0]}***.${extension}`;
}

/**
 * Retourne le message d'erreur approprié pour les erreurs 2FA
 */
export function getErrorMessage2FA(
  errorCode?: TwoFactorErrorType | string,
): string {
  const messages: Record<string, string> = {
    INVALID_CODE: "Le code saisi est incorrect. Veuillez réessayer.",
    EXPIRED_CODE: "Ce code a expiré. Veuillez en demander un nouveau.",
    TOO_MANY_ATTEMPTS:
      "Trop de tentatives. Veuillez attendre avant de réessayer.",
    CODE_ALREADY_USED: "Ce code a déjà été utilisé.",
  };

  return (
    messages[errorCode || ""] || "Une erreur est survenue. Veuillez réessayer."
  );
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return emailRegex.test(email);
}

/**
 * Valide qu'un mot de passe n'est pas vide
 */
export function isValidPassword(password: string): boolean {
  return password !== null && password !== "" && password !== undefined;
}

/**
 * Crée un objet d'état initial pour l'authentification
 */
export function createAuthState(): AuthState {
  return {
    email: ref<string>(""),
    password: ref<string>(""),
    displayType: ref<LoginErrorType | null>(null),
    openTwoFactor: ref<boolean>(false),
    openCgu: ref<boolean>(false),
    isLoggingIn: ref<boolean>(false),
    isVerifying2FA: ref<boolean>(false),
    isResendingCode: ref<boolean>(false),
  };
}
