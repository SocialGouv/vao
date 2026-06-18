import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AgrementDto } from "../../../dto";

export interface GetOneRoute extends BasicRoute {
  method: "GET";
  path: "/agrements/{agrementId}";
  params: {
    agrementId: string;
  };
  response: RouteResponseBody<{ agrement: AgrementDto | null }>;
}

export const GetOneRouteSchema: RouteSchema<GetOneRoute> = {
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
