import AppError, { AppErrorOptions } from "./error";

export interface ValidationAppErrorCause {
  errors: unknown;
  [key: string]: any; // si tu veux autoriser plus de champs
}

export interface ValidationAppErrorOptions
  extends Omit<AppErrorOptions, "name" | "cause"> {
  isOperational?: boolean;
  statusCode?: number;
}

export default class ValidationAppError extends AppError {
  public errors: unknown;

  constructor(
    cause: ValidationAppErrorCause,
    { statusCode = 400, isOperational = true }: ValidationAppErrorOptions = {},
  ) {
    super("Une erreur a été détectée dans le body", {
      cause,
      isOperational,
      name: "ValidationError",
      statusCode,
    });

    this.errors = cause.errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
