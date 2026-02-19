/* eslint-disable import/no-unresolved */
import type { GetListRoute } from "./getList";
import { GetListRouteSchema } from "./getList";

export type AgrementAdminRoutes = {
  GetList: GetListRoute;
};

export const AgrementAdminRoutesSchema = {
  GetList: GetListRouteSchema,
};
