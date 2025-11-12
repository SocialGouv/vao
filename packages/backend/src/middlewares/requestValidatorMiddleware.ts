import type { BasicRoute, RouteSchema } from "@vao/shared-bridge";
import { NextFunction } from "express";
import * as yup from "yup";

import type { RouteRequest, RouteResponse } from "../types/request";
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
) {
  return (
    req: RouteRequest<any>,
    _res: RouteResponse<T>,
    next: NextFunction,
  ) => {
    try {
      req.validatedParams = requestParamsValidator(
        validator.params,
        req.params,
      );
      req.validatedQuery = requestQueryValidator(validator.query, req.query);
      req.validatedBody = requestBodyValidator(validator.body, req.body);
    } catch (error) {
      log.w("missing or invalid parameter", error);
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
  params: any | undefined,
) {
  if (params && validator) {
    try {
      return validator.validateSync(params, { stripUnknown: true });
    } catch (error) {
      throw new Error(ERRORS.INVALID_PARAMS);
    }
  }
  return {};
}

export function requestQueryValidator<T>(
  validator: yup.AnySchema<T> | undefined,
  query: any | undefined,
) {
  if (query && validator) {
    try {
      return validator.validateSync(query, { stripUnknown: true });
    } catch (error) {
      throw new Error(ERRORS.INVALID_QUERY);
    }
  }
  return {};
}

export function requestBodyValidator<T>(
  validator: yup.AnySchema<T> | undefined,
  body: any | undefined,
) {
  if (body && validator) {
    try {
      log.d("✅ Validation OK");
      return validator.validateSync(body, { stripUnknown: true });
    } catch (error) {
      const e = error as yup.ValidationError;
      log.d("🚨 Invalid field paths:", e.path);
      log.d("🚨 Validation error details:", e.errors);
      throw new Error(ERRORS.INVALID_BODY);
    }
  }
  return {};
}
