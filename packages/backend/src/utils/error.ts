export interface AppErrorOptions {
  name?: string;
  statusCode?: number;
  cause?: unknown;
  isOperational?: boolean;
  metadata?: Record<string, unknown>;
}

export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public metadata?: Record<string, unknown>;

  constructor(
    message: string,
    {
      name,
      statusCode = 400,
      cause,
      isOperational = true,
      metadata,
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
    this.metadata = metadata;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
