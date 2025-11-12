/* eslint-disable import/no-unresolved */
import { GetOneAdminRoute, GetOneAdminRouteSchema } from "./getOne";

export type HebergementAdminRoutes = {
  GetOne: GetOneAdminRoute;
};

export const HebergementAdminRoutesSchema = {
  GetOne: GetOneAdminRouteSchema,
};
