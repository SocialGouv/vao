import type { BasicRoute, RouteSchema } from "@vao/shared-bridge";
import type { NextFunction, RequestHandler } from "express";
import * as yup from "yup";

import type { RouteRequest } from "../types/request";
import AppError from "../utils/error";
import logger from "../utils/logger";

const log = logger(module.filename);

const ERRORS = {
  INVALID_BODY: "INVALID_BODY",
  INVALID_PARAMS: "INVALID_PARAMS",
  INVALID_QUERY: "INVALID_QUERY",
};

export function requestValidatorMiddleware<T extends BasicRoute>(
  validator: RouteSchema<T>,
): RequestHandler<
  Record<string, string>,
  unknown,
  unknown,
  Record<string, string> | undefined
> {
  return (req, _res, next: NextFunction) => {
    const typedReq = req as unknown as RouteRequest<T>;
    try {
      typedReq.validatedParams = requestParamsValidator<T["params"]>(
        validator.params,
        typedReq.params,
      );
      typedReq.validatedQuery = requestQueryValidator<T["query"]>(
        validator.query,
        typedReq.query,
      );
      typedReq.validatedBody = requestBodyValidator<T["body"]>(
        validator.body,
        typedReq.body,
      );
    } catch {
      log.w("missing or invalid parameter");
      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }
    next();
  };
}

export function requestParamsValidator<T>(
  validator: yup.AnySchema<T> | undefined,
  params: unknown,
): T | undefined {
  if (params && validator) {
    try {
      return validator.validateSync(params, { stripUnknown: true });
    } catch {
      throw new Error(ERRORS.INVALID_PARAMS);
    }
  }
  return undefined;
}

export function requestQueryValidator<T>(
  validator: yup.AnySchema<T> | undefined,
  query: unknown,
): T | undefined {
  if (query && validator) {
    try {
      return validator.validateSync(query, { stripUnknown: true });
    } catch {
      throw new Error(ERRORS.INVALID_QUERY);
    }
  }
  return undefined;
}

export function requestBodyValidator<T>(
  validator: yup.AnySchema<T> | undefined,
  body: unknown,
): T | undefined {
  if (body && validator) {
    try {
      return validator.validateSync(body, { stripUnknown: true });
    } catch {
      throw new Error(ERRORS.INVALID_BODY);
    }
  }
  return undefined;
}
