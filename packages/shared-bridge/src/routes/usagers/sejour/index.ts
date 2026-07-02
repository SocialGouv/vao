import { type GetUsagersRoute, GetUsagersRouteSchema } from "./get";

export type SejourUsagersRoutes = {
  Get: GetUsagersRoute;
};

export const SejourUsagersRoutesSchema = {
  Get: GetUsagersRouteSchema,
};
