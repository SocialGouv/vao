/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";

export type HebergementUsagersRoutes = {
  GetOne: GetOneRoute;
};

export const HebergementUsagersRoutesSchema = {
  GetOne: GetOneRouteSchema,
};
