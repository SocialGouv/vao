const AppError = require("./error");

class ValidationAppError extends AppError {
  constructor(cause, { statusCode = 400, isOperational = true } = {}) {
    super("Une erreur a été détectée dans le body", {
      name: "ValidationError",
      cause,
      isOperational,
      statusCode,
    });

    this.errors = cause.errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ValidationAppError;
