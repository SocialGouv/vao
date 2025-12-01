import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { DocumentDto } from "../../../dto";

export interface PostDocumentRoute extends BasicRoute {
  method: "POST";
  path: "/documents/";
  body: DocumentDto;
  response: RouteResponseBody<{ uuid: string | null }>;
}
export const PostDocumentRouteSchema: RouteSchema<PostDocumentRoute> = {
  body: yup.object({
    category: yup.string().required("Catégorie obligatoire"),
    file: yup
      .mixed()
      .test(
        "file-required",
        "Fichier obligatoire",
        (value) => value instanceof File,
      )
      .required(),
  }) as yup.ObjectSchema<DocumentDto>,
};
