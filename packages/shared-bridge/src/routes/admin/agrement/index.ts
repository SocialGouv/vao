/* eslint-disable import/no-unresolved */
import type { GetListRoute } from "./getList";
import { GetListRouteSchema } from "./getList";
import type { PatchStatutRoute } from "./patchStatut";
import { PatchStatutRouteSchema } from "./patchStatut";

export type AgrementAdminRoutes = {
  GetList: GetListRoute;
  PatchStatut: PatchStatutRoute;
};

export const AgrementAdminRoutesSchema = {
  GetList: GetListRouteSchema,
  PatchStatut: PatchStatutRouteSchema,
};
