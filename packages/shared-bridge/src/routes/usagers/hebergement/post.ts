import * as yup from "yup";

import type { HebergementDto, UsagerHebergementBodyDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody } from "../..";
import {
  type WriteUsagerHebergementRouteSchema,
  legacyHebergementBodySchema,
  uniteHebergementBodyObjectSchema,
} from "./schema";

export interface PostUsagerRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/";
  body: UsagerHebergementBodyDto;
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const PostUsagerRouteSchema: WriteUsagerHebergementRouteSchema<PostUsagerRoute> =
  {
    legacy: {
      body: yup.object(
        legacyHebergementBodySchema(false),
      ) as unknown as yup.ObjectSchema<PostUsagerRoute["body"]>,
    },
    unite: {
      body: uniteHebergementBodyObjectSchema(
        false,
      ) as unknown as yup.ObjectSchema<PostUsagerRoute["body"]>,
    },
  };
