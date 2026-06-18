import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { FILE_CATEGORY } from "../../../constantes/file";
import type { DocumentDto } from "../../../dto";

export interface PostDocumentRoute extends BasicRoute {
  method: "POST";
  path: "/documents/admin";
  body: {
    category: DocumentDto["category"];
  };
  file: File;
  response: RouteResponseBody<{ uuid: string | null }>;
}

export const PostDocumentRouteSchema: RouteSchema<PostDocumentRoute> = {
  body: yup.object({
    category: yup
      .string()
      .oneOf(Object.values(FILE_CATEGORY))
      .required("Catégorie obligatoire"),
  }),
};
