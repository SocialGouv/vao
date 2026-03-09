/* eslint-disable import/no-unresolved */
import type { GetListRoute } from "./getList";
import { GetListRouteSchema } from "./getList";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PatchStatutRoute } from "./patchStatut";
import { PatchStatutRouteSchema } from "./patchStatut";

export type AgrementAdminRoutes = {
  GetList: GetListRoute;
  GetOne: GetOneRoute;
  PatchStatut: PatchStatutRoute;
};

export const AgrementAdminRoutesSchema = {
  GetList: GetListRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchStatut: PatchStatutRouteSchema,
};
