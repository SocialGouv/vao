import * as yup from "yup";

import type { HebergementDto } from "../../dto";
import type { BasicRoute, RouteResponseBody, RouteSchema } from "..";

export interface GetOneAdminRoute extends BasicRoute {
  method: "GET";
  path: "/hebergement/admin/{id}";
  params: {
    id: string;
  };
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const GetOneAdminRouteSchema: RouteSchema<GetOneAdminRoute> = {
  params: yup.object({
    id: yup.string().required(),
  }),
};
