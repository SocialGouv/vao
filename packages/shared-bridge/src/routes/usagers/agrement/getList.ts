import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AgrementDto } from "../../../dto";

export interface GetListRoute extends BasicRoute {
  method: "GET";
  path: "/agrements/list";
  query: {
    statut?: string;
  };
  response: RouteResponseBody<{ agrements: AgrementDto[] | [] }>;
}

export const GetListRouteSchema: RouteSchema<GetListRoute> = {
  query: yup.object({
    statut: yup.string().optional(),
  }),
};
