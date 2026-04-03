import {
  type BasicRoute,
  type RouteSchema,
  ERRORS_COMMON,
} from "@vao/shared-bridge";
import { NextFunction } from "express";
import * as yup from "yup";

import type { RouteRequest, RouteResponse } from "../types/request";
import AppError from "../utils/error";
import logger from "../utils/logger";

const log = logger(module.filename);

export function requestValidatorMiddleware<T extends BasicRoute>(
  validator: RouteSchema<T>,
) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      log.w("INVALID_PARAMS", error);
      throw new Error(ERRORS_COMMON.INVALID_PARAMS);
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
      // les tableaux étant mal interpretés par query-string, on parse les sous objets ou tableaux en JSON
      const parsedQuery = Object.entries(query).reduce((acc, [key, value]) => {
        if (
          typeof value === "string" &&
          (/^\{".*"\}$/.test(value) || /^\[.*\]$/.test(value))
        ) {
          try {
            return { ...acc, [key]: JSON.parse(value) };
          } catch (error: unknown) {
            log.d("error parsing query", key, value, (error as Error).message);
          }
        }
        return { ...acc, [key]: value };
      }, {});
      const validatedQuery = validator.validateSync(parsedQuery, {
        stripUnknown: true,
      });
      return validatedQuery;
    } catch (error) {
      log.d("INVALID_QUERY", (error as Error).message, error);
      throw new Error(ERRORS_COMMON.INVALID_QUERY);
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
      log.d("INVALID_BODY", error);
      const e = error as yup.ValidationError;
      log.d("🚨 Invalid field paths:", e.path);
      log.d("🚨 Validation error details:", e.errors);
      throw new Error(ERRORS_COMMON.INVALID_BODY);
    }
  }
  return {};
}
