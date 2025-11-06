/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { SaveRoute } from "./save";
import { SaveRouteSchema } from "./save";

export type AgrementUsagersRoutes = {
  GetOne: GetOneRoute;
  Save: SaveRoute;
};

export const AgrementUsagersRoutesSchema = {
  GetOne: GetOneRouteSchema,
  Save: SaveRouteSchema,
};
