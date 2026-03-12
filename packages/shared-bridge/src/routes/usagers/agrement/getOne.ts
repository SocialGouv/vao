import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AgrementDto } from "../../../dto";

export interface GetOneRoute extends BasicRoute {
  method: "GET";
  path: "/agrements/organisme/{organismeId}";
  params: {
    organismeId: string;
  };
  response: RouteResponseBody<{ agrement: AgrementDto | null }>;
}

export const GetOneRouteSchema: RouteSchema<GetOneRoute> = {
  params: yup.object({
    organismeId: yup.string().required(),
  }),
};
