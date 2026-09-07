import type { GetListUsagerRoute } from "./getList";
import { GetListUsagerRouteSchema } from "./getList";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PostUsagerRoute } from "./post";
import { PostUsagerRouteSchema } from "./post";
import type { PostBrouillonUsagerRoute } from "./postBrouillon";
import { PostBrouillonUsagerRouteSchema } from "./postBrouillon";
import type { PostByIdUsagerRoute } from "./postById";
import { PostByIdUsagerRouteSchema } from "./postById";
import type { PutUsagerRoute } from "./put";
import { PutUsagerRouteSchema } from "./put";
import type { PutActivateUsagerRoute } from "./putActivate";
import { PutActivateUsagerRouteSchema } from "./putActivate";
import type { PutBrouillonUsagerRoute } from "./putBrouillon";
import { PutBrouillonUsagerRouteSchema } from "./putBrouillon";

export type HebergementUsagersRoutes = {
  GetList: GetListUsagerRoute;
  GetOne: GetOneRoute;
  Post: PostUsagerRoute;
  PostBrouillon: PostBrouillonUsagerRoute;
  PostById: PostByIdUsagerRoute;
  Put: PutUsagerRoute;
  PutActivate: PutActivateUsagerRoute;
  PutBrouillon: PutBrouillonUsagerRoute;
};

export const HebergementUsagersRoutesSchema = {
  GetList: GetListUsagerRouteSchema,
  GetOne: GetOneRouteSchema,
  Post: PostUsagerRouteSchema,
  PostBrouillon: PostBrouillonUsagerRouteSchema,
  PostById: PostByIdUsagerRouteSchema,
  Put: PutUsagerRouteSchema,
  PutActivate: PutActivateUsagerRouteSchema,
  PutBrouillon: PutBrouillonUsagerRouteSchema,
};

export type { WriteUsagerHebergementRouteSchema } from "./schema";
