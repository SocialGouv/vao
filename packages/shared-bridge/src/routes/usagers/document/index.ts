/* eslint-disable import/no-unresolved */
import type { PostDocumentRoute } from "./postDocument";
import { PostDocumentRouteSchema } from "./postDocument";

export type DocumentUsagersRoutes = {
  PostDocument: PostDocumentRoute;
};

export const DocumentUsagersRoutesSchema = {
  PostDocument: PostDocumentRouteSchema,
};
