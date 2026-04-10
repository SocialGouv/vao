/* eslint-disable import/no-unresolved */
import type { GetAllActivitesRoute } from "./getAllActivites";
import { GetAllActivitesRouteSchema } from "./getAllActivites";
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
import type { PostAgrementRoute } from "./postAgrement";
import { PostAgrementRouteSchema } from "./postAgrement";
import type { PostMessageRoute } from "./postMessage";
import { PostMessageRouteSchema } from "./postMessage";

export type AgrementUsagersRoutes = {
  GetList: GetListRoute;
  GetOne: GetOneRoute;
  PostAgrement: PostAgrementRoute;
  GetAllActivites: GetAllActivitesRoute;
  GetHistory: GetHistoryRoute;
  PatchStatut: PatchStatutRoute;
  PostMessage: PostMessageRoute;
  GetMessages: GetMessagesRoute;
  PatchMessages: PatchMessagesRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetAllActivites: GetAllActivitesRouteSchema,
  GetHistory: GetHistoryRouteSchema,
  GetList: GetListRouteSchema,
  GetMessages: GetMessagesRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchMessages: PatchMessagesRouteSchema,
  PatchStatut: PatchStatutRouteSchema,
  PostAgrement: PostAgrementRouteSchema,
  PostMessage: PostMessageRouteSchema,
};
