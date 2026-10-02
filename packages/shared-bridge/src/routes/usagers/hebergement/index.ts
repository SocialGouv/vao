import type { CheckSiteSimilaritesRoute } from "./checkSimilarites";
import { CheckSiteSimilaritesRouteSchema } from "./checkSimilarites";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PatchSiteRoute } from "./patchSite";
import { PatchSiteRouteSchema } from "./patchSite";
import type { PostSiteRoute } from "./postSite";
import { PostSiteRouteSchema } from "./postSite";

export type HebergementUsagersRoutes = {
  CheckSimilarites: CheckSiteSimilaritesRoute;
  GetOne: GetOneRoute;
  PatchSite: PatchSiteRoute;
  PostSite: PostSiteRoute;
};

export const HebergementUsagersRoutesSchema = {
  CheckSimilarites: CheckSiteSimilaritesRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchSite: PatchSiteRouteSchema,
  PostSite: PostSiteRouteSchema,
};

export type {
  SiteSimilariteResult,
  SiteSimilariteType,
} from "./checkSimilarites";
export type { PatchSiteBody, ResponsableDto } from "./patchSite";
export type { PostSiteBody, PostSiteResponse } from "./postSite";
