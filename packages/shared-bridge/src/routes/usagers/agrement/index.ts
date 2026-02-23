/* eslint-disable import/no-unresolved */
import type { GetAllActivitesRoute } from "./getAllActivites";
import { GetAllActivitesRouteSchema } from "./getAllActivites";
import type { GetHistoryRoute } from "./getHistory";
import { GetHistoryRouteSchema } from "./getHistory";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PostAgrementRoute } from "./postAgrement";
import { PostAgrementRouteSchema } from "./postAgrement";

export type AgrementUsagersRoutes = {
  GetOne: GetOneRoute;
  PostAgrement: PostAgrementRoute;
  GetAllActivites: GetAllActivitesRoute;
  GetHistory: GetHistoryRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetAllActivites: GetAllActivitesRouteSchema,
  GetHistory: GetHistoryRouteSchema,
  GetOne: GetOneRouteSchema,
  PostAgrement: PostAgrementRouteSchema,
};
