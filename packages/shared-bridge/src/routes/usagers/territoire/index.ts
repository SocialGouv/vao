/* eslint-disable import/no-unresolved */
import type { GetByAgrementRegionUserRoute } from "./get-by-agrement-region-user";
import { GetByAgrementRegionUserRouteSchema } from "./get-by-agrement-region-user";

export type TerritoireUsagersRoutes = {
  GetByAgrementRegionUser: GetByAgrementRegionUserRoute;
};

export const TerritoireUsagersRoutesSchema = {
  GetByAgrementRegionUser: GetByAgrementRegionUserRouteSchema,
};
