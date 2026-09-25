import type { CheckSiteSimilaritesRoute } from "./checkSimilarites";
import { CheckSiteSimilaritesRouteSchema } from "./checkSimilarites";
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";

export type HebergementUsagersRoutes = {
  CheckSimilarites: CheckSiteSimilaritesRoute;
  GetOne: GetOneRoute;
};

export const HebergementUsagersRoutesSchema = {
  CheckSimilarites: CheckSiteSimilaritesRouteSchema,
  GetOne: GetOneRouteSchema,
};

export type {
  SiteSimilariteResult,
  SiteSimilariteType,
} from "./checkSimilarites";
