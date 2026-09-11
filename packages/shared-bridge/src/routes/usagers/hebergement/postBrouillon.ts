import * as yup from "yup";

import type { HebergementDto, UsagerHebergementBodyDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody } from "../..";
import {
  type WriteUsagerHebergementRouteSchema,
  legacyHebergementBodySchema,
  uniteHebergementBodyObjectSchema,
} from "./schema";

export interface PostBrouillonUsagerRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/brouillon/";
  body: UsagerHebergementBodyDto;
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const PostBrouillonUsagerRouteSchema: WriteUsagerHebergementRouteSchema<PostBrouillonUsagerRoute> =
  {
    legacy: {
      body: yup.object(
        legacyHebergementBodySchema(true),
      ) as unknown as yup.ObjectSchema<PostBrouillonUsagerRoute["body"]>,
    },
    unite: {
      body: uniteHebergementBodyObjectSchema(
        true,
      ) as unknown as yup.ObjectSchema<PostBrouillonUsagerRoute["body"]>,
    },
  };
