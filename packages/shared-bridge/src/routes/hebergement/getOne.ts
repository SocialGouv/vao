import * as yup from "yup";

import type { HebergementDto } from "../../dto";
import type { BasicRoute, RouteResponseBody, RouteSchema } from "..";

export interface GetOneRoute extends BasicRoute {
  method: "GET";
  path: "/hebergement/{id}";
  params: {
    id: string;
  };
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const GetOneRouteSchema: RouteSchema<GetOneRoute> = {
  params: yup.object({
    id: yup.string().required(),
  }),
};
