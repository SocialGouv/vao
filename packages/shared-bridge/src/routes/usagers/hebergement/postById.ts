import * as yup from "yup";

import type { HebergementDto, UsagerHebergementBodyDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody } from "../..";
import {
  type WriteUsagerHebergementRouteSchema,
  legacyHebergementBodySchema,
  uniteHebergementBodyObjectSchema,
} from "./schema";

export interface PostByIdUsagerRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/{id}";
  params: {
    id: string;
  };
  body: UsagerHebergementBodyDto;
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const PostByIdUsagerRouteSchema: WriteUsagerHebergementRouteSchema<PostByIdUsagerRoute> =
  {
    legacy: {
      body: yup.object(
        legacyHebergementBodySchema(false),
      ) as unknown as yup.ObjectSchema<PostByIdUsagerRoute["body"]>,
      params: yup.object({
        id: yup.string().required(),
      }),
    },
    unite: {
      body: uniteHebergementBodyObjectSchema(
        false,
      ) as unknown as yup.ObjectSchema<PostByIdUsagerRoute["body"]>,
      params: yup.object({
        id: yup.string().required(),
      }),
    },
  };
