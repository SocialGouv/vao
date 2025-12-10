/* eslint-disable import/no-unresolved */
import type { GetSuccesseurRoute } from "./getSuccesseur";
import { GetSuccesseurRouteSchema } from "./getSuccesseur";

export type SiretRoutes = {
  GetSuccesseur: GetSuccesseurRoute;
};

export const SiretRoutesSchema = {
  GetSuccesseur: GetSuccesseurRouteSchema,
};
