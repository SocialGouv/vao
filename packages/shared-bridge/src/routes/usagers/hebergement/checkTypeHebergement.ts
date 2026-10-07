import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export interface CheckTypeHebergementBody {
  siteId: string;
  organismeId: number;
  hebergementTypeValue: string;
}

export interface CheckTypeHebergementResponse {
  incoherence: boolean;
  typeDeclare: string | null;
}

export interface CheckTypeHebergementRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/site/type-hebergement-control";
  body: CheckTypeHebergementBody;
  response: RouteResponseBody<CheckTypeHebergementResponse>;
}

export const CheckTypeHebergementRouteSchema: RouteSchema<CheckTypeHebergementRoute> =
  {
    body: yup.object({
      hebergementTypeValue: yup.string().required(),
      organismeId: yup.number().required(),
      siteId: yup.string().required(),
    }) as yup.ObjectSchema<CheckTypeHebergementBody>,
  };
