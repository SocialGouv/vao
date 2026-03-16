import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { AGREMENT_STATUT } from "../../../constantes";
import type { AgrementDto } from "../../../dto";

export interface GetListRoute extends BasicRoute {
  method: "GET";
  path: "/agrements";
  query: {
    statut?: string;
  };
  response: RouteResponseBody<{ agrements: AgrementDto[] | [] }>;
}

export const GetListRouteSchema: RouteSchema<GetListRoute> = {
  query: yup.object({
    statut: yup.string().oneOf(Object.values(AGREMENT_STATUT)).optional(),
  }),
};
