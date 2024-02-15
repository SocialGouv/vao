class AppError extends Error {
  constructor(
    message,
    { name, statusCode = 400, cause, isOperational = true } = {},
  ) {
    if (cause) {
      super(message, { cause });
    } else {
      super(message);
    }

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
