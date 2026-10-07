import type { CheckSiteSimilaritesRoute } from "./checkSimilarites";
import { CheckSiteSimilaritesRouteSchema } from "./checkSimilarites";
import type { CheckTypeHebergementRoute } from "./checkTypeHebergement";
import { CheckTypeHebergementRouteSchema } from "./checkTypeHebergement";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PatchSiteRoute } from "./patchSite";
import { PatchSiteRouteSchema } from "./patchSite";
import type { PostSiteRoute } from "./postSite";
import { PostSiteRouteSchema } from "./postSite";

export type HebergementUsagersRoutes = {
  CheckSimilarites: CheckSiteSimilaritesRoute;
  CheckTypeHebergement: CheckTypeHebergementRoute;
  GetOne: GetOneRoute;
  PatchSite: PatchSiteRoute;
  PostSite: PostSiteRoute;
};

export const HebergementUsagersRoutesSchema = {
  CheckSimilarites: CheckSiteSimilaritesRouteSchema,
  CheckTypeHebergement: CheckTypeHebergementRouteSchema,
  GetOne: GetOneRouteSchema,
  PatchSite: PatchSiteRouteSchema,
  PostSite: PostSiteRouteSchema,
};

export type {
  SiteSimilariteResult,
  SiteSimilariteType,
} from "./checkSimilarites";
export type {
  CheckTypeHebergementBody,
  CheckTypeHebergementResponse,
} from "./checkTypeHebergement";
export type { PatchSiteBody, ResponsableDto } from "./patchSite";
export type { PostSiteBody, PostSiteResponse } from "./postSite";
