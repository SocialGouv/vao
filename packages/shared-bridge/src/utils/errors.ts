import { ERRORS_SIRET, ERRORS_SIRET_MESSAGES } from "../constantes";

export function getErrorMessage(error: ERRORS_SIRET): string {
  return ERRORS_SIRET_MESSAGES[error] ?? "Une erreur inconnue est survenue.";
}
