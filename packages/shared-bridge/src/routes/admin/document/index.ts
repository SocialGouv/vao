/* eslint-disable import/no-unresolved */
import type { PostDocumentRoute } from "./postDocument";
import { PostDocumentRouteSchema } from "./postDocument";

export type DocumentAdminRoutes = {
  PostDocument: PostDocumentRoute;
};

export const DocumentAdminRoutesSchema = {
  PostDocument: PostDocumentRouteSchema,
};
