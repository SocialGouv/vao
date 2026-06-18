import { ERRORS_SIRET, ERRORS_SIRET_MESSAGES } from "../constantes";

export function getErrorMessage(error: ERRORS_SIRET): string {
  return ERRORS_SIRET_MESSAGES[error] ?? "Une erreur inconnue est survenue.";
}

export class FunctionalException extends Error {
  public code: string;
  public detail?: Record<string, unknown>;

  constructor(code: string, detail?: Record<string, unknown>) {
    super(code);
    this.detail = detail;

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "FunctionalException";
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}
