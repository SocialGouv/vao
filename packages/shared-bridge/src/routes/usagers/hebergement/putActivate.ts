import * as yup from "yup";

import type { HebergementDto, UsagerHebergementBodyDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody } from "../..";
import {
  type WriteUsagerHebergementRouteSchema,
  legacyHebergementBodySchema,
  uniteHebergementBodyObjectSchema,
} from "./schema";

export interface PutActivateUsagerRoute extends BasicRoute {
  method: "PUT";
  path: "/hebergement/{id}/activate";
  params: {
    id: string;
  };
  body: UsagerHebergementBodyDto;
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const PutActivateUsagerRouteSchema: WriteUsagerHebergementRouteSchema<PutActivateUsagerRoute> =
  {
    legacy: {
      body: yup.object(
        legacyHebergementBodySchema(false),
      ) as unknown as yup.ObjectSchema<PutActivateUsagerRoute["body"]>,
      params: yup.object({
        id: yup.string().required(),
      }),
    },
    unite: {
      body: uniteHebergementBodyObjectSchema(
        false,
      ) as unknown as yup.ObjectSchema<PutActivateUsagerRoute["body"]>,
      params: yup.object({
        id: yup.string().required(),
      }),
    },
  };
