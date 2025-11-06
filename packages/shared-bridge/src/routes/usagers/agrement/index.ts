/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";

export type AgrementUsagersRoutes = {
  GetOne: GetOneRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetOne: GetOneRouteSchema,
};
