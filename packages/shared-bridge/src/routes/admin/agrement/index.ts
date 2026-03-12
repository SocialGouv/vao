/* eslint-disable import/no-unresolved */
import type { GetHistoryRoute } from "./getHistory";
import { GetHistoryRouteSchema } from "./getHistory";
import type { GetListRoute } from "./getList";
import { GetListRouteSchema } from "./getList";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PatchStatutRoute } from "./patchStatut";
import { PatchStatutRouteSchema } from "./patchStatut";
import type { PostMessageRoute } from "./postMessage";
import { PostMessageRouteSchema } from "./postMessage";

export type AgrementAdminRoutes = {
  GetList: GetListRoute;
  GetOne: GetOneRoute;
  PatchStatut: PatchStatutRoute;
  GetHistory: GetHistoryRoute;
  PostMessage: PostMessageRoute;
};

export const AgrementAdminRoutesSchema = {
  GetHistory: GetHistoryRouteSchema,
  GetList: GetListRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchStatut: PatchStatutRouteSchema,
  PostMessage: PostMessageRouteSchema,
};
