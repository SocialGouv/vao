/* eslint-disable import/no-unresolved */
import type { GetAllActivitesRoute } from "./getAllActivites";
//import { GetAllActivitesRouteSchema } from "./getAllActivites";
import type { GetHistoryRoute } from "./getHistory";
import { GetHistoryRouteSchema } from "./getHistory";
import type { GetListRoute } from "./getList";
import { GetListRouteSchema } from "./getList";
import type { GetMessagesRoute } from "./getMessages";
import { GetMessagesRouteSchema } from "./getMessages";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PatchMessagesRoute } from "./patchMessages";
import { PatchMessagesRouteSchema } from "./patchMessages";
import type { PatchStatutRoute } from "./patchStatut";
import { PatchStatutRouteSchema } from "./patchStatut";
import type { PostMessageRoute } from "./postMessage";
import { PostMessageRouteSchema } from "./postMessage";

export type AgrementAdminRoutes = {
  GetAllActivites: GetAllActivitesRoute;
  GetList: GetListRoute;
  GetOne: GetOneRoute;
  PatchStatut: PatchStatutRoute;
  GetHistory: GetHistoryRoute;
  PostMessage: PostMessageRoute;
  GetMessages: GetMessagesRoute;
  PatchMessages: PatchMessagesRoute;
};

export const AgrementAdminRoutesSchema = {
  //  GetAllActivites: GetAllActivitesRouteSchema,
  GetHistory: GetHistoryRouteSchema,
  GetList: GetListRouteSchema,
  GetMessages: GetMessagesRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchMessages: PatchMessagesRouteSchema,
  PatchStatut: PatchStatutRouteSchema,
  PostMessage: PostMessageRouteSchema,
};
