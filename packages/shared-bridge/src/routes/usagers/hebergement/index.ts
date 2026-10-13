import type { CheckSiteSimilaritesRoute } from "./checkSimilarites";
import { CheckSiteSimilaritesRouteSchema } from "./checkSimilarites";
import type { CheckTypeHebergementRoute } from "./checkTypeHebergement";
import { CheckTypeHebergementRouteSchema } from "./checkTypeHebergement";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { GetSiteRoute } from "./getSite";
import { GetSiteRouteSchema } from "./getSite";
import type { PatchSiteRoute } from "./patchSite";
import { PatchSiteRouteSchema } from "./patchSite";
import type { PatchUniteHebergementRoute } from "./patchUniteHebergement";
import { PatchUniteHebergementRouteSchema } from "./patchUniteHebergement";
import type { PostSiteRoute } from "./postSite";
import { PostSiteRouteSchema } from "./postSite";
import type { PostUniteHebergementRoute } from "./postUniteHebergement";
import { PostUniteHebergementRouteSchema } from "./postUniteHebergement";

export type HebergementUsagersRoutes = {
  CheckSimilarites: CheckSiteSimilaritesRoute;
  CheckTypeHebergement: CheckTypeHebergementRoute;
  GetOne: GetOneRoute;
  GetSite: GetSiteRoute;
  PatchSite: PatchSiteRoute;
  PostSite: PostSiteRoute;
  PostUniteHebergement: PostUniteHebergementRoute;
  PatchUniteHebergement: PatchUniteHebergementRoute;
};

export const HebergementUsagersRoutesSchema = {
  CheckSimilarites: CheckSiteSimilaritesRouteSchema,
  CheckTypeHebergement: CheckTypeHebergementRouteSchema,
  GetOne: GetOneRouteSchema,
  GetSite: GetSiteRouteSchema,
  PatchSite: PatchSiteRouteSchema,
  PatchUniteHebergement: PatchUniteHebergementRouteSchema,
  PostSite: PostSiteRouteSchema,
  PostUniteHebergement: PostUniteHebergementRouteSchema,
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
