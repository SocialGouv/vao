import { type GetOneAdminRoute, GetOneAdminRouteSchema } from "./getOne";

export type HebergementAdminRoutes = {
  GetOne: GetOneAdminRoute;
};

export const HebergementAdminRoutesSchema = {
  GetOne: GetOneAdminRouteSchema,
};
