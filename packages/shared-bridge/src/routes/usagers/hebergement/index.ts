import type { CheckSiteSimilaritesRoute } from "./checkSimilarites";
import { CheckSiteSimilaritesRouteSchema } from "./checkSimilarites";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PostSiteRoute } from "./postSite";
import { PostSiteRouteSchema } from "./postSite";

export type HebergementUsagersRoutes = {
  CheckSimilarites: CheckSiteSimilaritesRoute;
  GetOne: GetOneRoute;
  PostSite: PostSiteRoute;
};

export const HebergementUsagersRoutesSchema = {
  CheckSimilarites: CheckSiteSimilaritesRouteSchema,
  GetOne: GetOneRouteSchema,
  PostSite: PostSiteRouteSchema,
};

export type {
  SiteSimilariteResult,
  SiteSimilariteType,
} from "./checkSimilarites";
export type { PostSiteBody } from "./postSite";
