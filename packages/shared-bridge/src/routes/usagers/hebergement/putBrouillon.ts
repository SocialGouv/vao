import * as yup from "yup";

import type { HebergementDto, UsagerHebergementBodyDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody } from "../..";
import {
  type WriteUsagerHebergementRouteSchema,
  legacyHebergementBodySchema,
  uniteHebergementBodyObjectSchema,
} from "./schema";

export interface PutBrouillonUsagerRoute extends BasicRoute {
  method: "PUT";
  path: "/hebergement/{id}/brouillon";
  params: {
    id: string;
  };
  body: UsagerHebergementBodyDto;
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const PutBrouillonUsagerRouteSchema: WriteUsagerHebergementRouteSchema<PutBrouillonUsagerRoute> =
  {
    legacy: {
      body: yup.object(
        legacyHebergementBodySchema(true),
      ) as unknown as yup.ObjectSchema<PutBrouillonUsagerRoute["body"]>,
      params: yup.object({
        id: yup.string().required(),
      }),
    },
    unite: {
      body: uniteHebergementBodyObjectSchema(
        true,
      ) as unknown as yup.ObjectSchema<PutBrouillonUsagerRoute["body"]>,
      params: yup.object({
        id: yup.string().required(),
      }),
    },
  };
