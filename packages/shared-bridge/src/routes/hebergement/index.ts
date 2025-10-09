/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";

export type HebergementRoutes = {
  GetOne: GetOneRoute;
};

export const HebergementRoutesSchema = {
  GetOne: GetOneRouteSchema,
};
