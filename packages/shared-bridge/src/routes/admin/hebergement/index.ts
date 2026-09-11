import type { GetListAdminRoute } from "./getList";
import { GetListAdminRouteSchema } from "./getList";
import type { GetOneAdminRoute } from "./getOne";
import { GetOneAdminRouteSchema } from "./getOne";
import type { PostAdminRoute } from "./post";
import { PostAdminRouteSchema } from "./post";
import type { PutAdminRoute } from "./put";
import { PutAdminRouteSchema } from "./put";

export type HebergementAdminRoutes = {
  GetList: GetListAdminRoute;
  GetOne: GetOneAdminRoute;
  Post: PostAdminRoute;
  Put: PutAdminRoute;
};

export const HebergementAdminRoutesSchema = {
  GetList: GetListAdminRouteSchema,
  GetOne: GetOneAdminRouteSchema,
  Post: PostAdminRouteSchema,
  Put: PutAdminRouteSchema,
};
