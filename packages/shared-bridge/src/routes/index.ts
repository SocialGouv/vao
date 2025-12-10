/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-unresolved */
import * as yup from "yup";

export interface BasicRoute {
  path: string;
  params?: Record<string, string>;
  body?: Record<string, any>;
  query?: Record<string, string>;
  response: RouteResponseBody<Record<string, any>> | void;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

export type RouteResponseBody<T> = T;

export type RouteSchema<T extends BasicRoute> = {
  params?: yup.ObjectSchema<NonNullable<T["params"]>>;
  body?: yup.ObjectSchema<NonNullable<T["body"]>>;
  query?: yup.ObjectSchema<NonNullable<T["query"]>>;
};

export type { HebergementRoutes } from "./hebergement";
export { HebergementRoutesSchema } from "./hebergement";
export type { SiretRoutes } from "./usagers/siret";
export { SiretRoutesSchema } from "./usagers/siret";
