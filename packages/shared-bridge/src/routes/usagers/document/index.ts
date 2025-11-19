/* eslint-disable import/no-unresolved */
import type { GetOneRoute } from "./getOne";
import { GetOneRouteSchema } from "./getOne";
import type { PostDocumentRoute } from "./postDocument";
import { PostDocumentRouteSchema } from "./postDocument";

export type DocumentUsagersRoutes = {
  GetOne: GetOneRoute;
  PostDocument: PostDocumentRoute;
};

export const DocumentUsagersRoutesSchema = {
  GetOne: GetOneRouteSchema,
  PostDocument: PostDocumentRouteSchema,
};
