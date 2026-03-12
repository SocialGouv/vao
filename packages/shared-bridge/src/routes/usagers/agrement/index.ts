/* eslint-disable import/no-unresolved */
import type { GetAllActivitesRoute } from "./getAllActivites";
import { GetAllActivitesRouteSchema } from "./getAllActivites";
import type { GetHistoryRoute } from "./getHistory";
import { GetHistoryRouteSchema } from "./getHistory";
import type { GetListRoute } from "./getList";
import { GetListRouteSchema } from "./getList";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PatchStatutRoute } from "./patchStatut";
import { PatchStatutRouteSchema } from "./patchStatut";
import type { PostAgrementRoute } from "./postAgrement";
import { PostAgrementRouteSchema } from "./postAgrement";

export type AgrementUsagersRoutes = {
  GetList: GetListRoute;
  GetOne: GetOneRoute;
  PostAgrement: PostAgrementRoute;
  GetAllActivites: GetAllActivitesRoute;
  GetHistory: GetHistoryRoute;
  PatchStatut: PatchStatutRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetAllActivites: GetAllActivitesRouteSchema,
  GetHistory: GetHistoryRouteSchema,
  GetList: GetListRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchStatut: PatchStatutRouteSchema,
  PostAgrement: PostAgrementRouteSchema,
};
