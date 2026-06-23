/* eslint-disable @typescript-eslint/no-explicit-any */

import * as yup from "yup";

export interface BasicRoute {
  path: string;
  params?: Record<string, string>;
  body?: Record<string, any>;
  query?: Record<
    string,
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[]
    | Record<string, unknown>
  >;
  response:
    | RouteResponseBody<Record<string, any>>
    | RouteResponseBody<Record<string, any>[]>
    | void;
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
}

export type RouteResponseBody<T> = T;

export type RouteResponseError = {
  message: string;
  name: string;
};

export type RouteSchema<T extends BasicRoute> = {
  params?: yup.ObjectSchema<NonNullable<T["params"]>>;
  body?: yup.ObjectSchema<NonNullable<T["body"]>>;
  query?: yup.ObjectSchema<NonNullable<T["query"]>>;
};

export type { AgrementAdminRoutes } from "./admin/agrement";
export { AgrementAdminRoutesSchema } from "./admin/agrement";
export type { DocumentAdminRoutes } from "./admin/document";
export { DocumentAdminRoutesSchema } from "./admin/document";
export type { EigAdminRoutes } from "./admin/eig";
export { EigAdminRoutesSchema } from "./admin/eig";
export type { HebergementAdminRoutes } from "./admin/hebergement";
export { HebergementAdminRoutesSchema } from "./admin/hebergement";
export type { OrganismeAdminRoutes } from "./admin/organisme";
export { OrganismeAdminRoutesSchema } from "./admin/organisme";
export type { UserAdminRoutes } from "./admin/users";
export { UserAdminRoutesSchema } from "./admin/users";
export type { AgrementUsagersRoutes } from "./usagers/agrement";
export { AgrementUsagersRoutesSchema } from "./usagers/agrement";
export type { DocumentUsagersRoutes } from "./usagers/document";
export { DocumentUsagersRoutesSchema } from "./usagers/document";
export type { HebergementUsagersRoutes } from "./usagers/hebergement";
export { HebergementUsagersRoutesSchema } from "./usagers/hebergement";
export type { SiretRoutes } from "./usagers/siret";
export { SiretRoutesSchema } from "./usagers/siret";
export type { TerritoireUsagersRoutes } from "./usagers/territoire";
export { TerritoireUsagersRoutesSchema } from "./usagers/territoire";
export type { UserUsagersRoutes } from "./usagers/users";
export { UserUsagersRoutesSchema } from "./usagers/users";
