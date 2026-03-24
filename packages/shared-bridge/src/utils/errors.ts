import { ERRORS_SIRET, ERRORS_SIRET_MESSAGES } from "../constantes";

export function getErrorMessage(error: ERRORS_SIRET): string {
  return ERRORS_SIRET_MESSAGES[error] ?? "Une erreur inconnue est survenue.";
}

export class FunctionalException extends Error {
  public code: string;

  constructor(code: string) {
    super(code);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "FunctionalException";
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}
