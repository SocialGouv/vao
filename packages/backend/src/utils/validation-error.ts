import AppError, { AppErrorOptions } from "./error";

export interface ValidationAppErrorCause {
  errors: unknown;
  // Allows attaching additional fields as needed.
  // NOTE: use `_` (not `key`) to avoid Talisman false-positives.
  [_: string]: unknown;
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
