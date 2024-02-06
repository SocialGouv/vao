class AppError extends Error {
  constructor(
    message,
    { name, statusCode = 400, cause, isOperational = true } = {}
  ) {
    if (cause) {
      super(message, { cause });
    } else {
      super(message);
    }

    if (name) {
      this.name = name;
    }
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports.AppError = AppError;

module.exports.errorHandler = function errorHandler(error) {
  return error;
};
