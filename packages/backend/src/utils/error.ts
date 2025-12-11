export interface AppErrorOptions {
  name?: string;
  statusCode?: number;
  cause?: unknown;
  isOperational?: boolean;
}

export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    {
      name,
      statusCode = 400,
      cause,
      isOperational = true,
    }: AppErrorOptions = {},
  ) {
    if (cause !== undefined) {
      super(message, { cause });
    } else {
      super(message);
    }

    this.name = name ?? "AppError";

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
