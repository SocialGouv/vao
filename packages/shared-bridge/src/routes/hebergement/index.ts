/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import { type GetOneAdminRoute, GetOneAdminRouteSchema } from "./getOneAdmin";

export type HebergementRoutes = {
  GetOne: GetOneRoute;
  GetOneAdmin: GetOneAdminRoute;
};

export const HebergementRoutesSchema = {
  GetOne: GetOneRouteSchema,
  GetOneAdmin: GetOneAdminRouteSchema,
};
