/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PostAgrementRoute } from "./postAgrement";
import { PostAgrementRouteSchema } from "./postAgrement";

export type AgrementUsagersRoutes = {
  GetOne: GetOneRoute;
  PostAgrement: PostAgrementRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetOne: GetOneRouteSchema,
  PostAgrement: PostAgrementRouteSchema,
};
