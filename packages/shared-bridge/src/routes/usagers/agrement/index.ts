/* eslint-disable import/no-unresolved */
import type { GetAllActivitesRoute } from "./getAllActivites";
import { GetAllActivitesRouteSchema } from "./getAllActivites";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PostAgrementRoute } from "./postAgrement";
import { PostAgrementRouteSchema } from "./postAgrement";

export type AgrementUsagersRoutes = {
  GetOne: GetOneRoute;
  PostAgrement: PostAgrementRoute;
  GetAllActivites: GetAllActivitesRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetAllActivites: GetAllActivitesRouteSchema,
  GetOne: GetOneRouteSchema,
  PostAgrement: PostAgrementRouteSchema,
};
