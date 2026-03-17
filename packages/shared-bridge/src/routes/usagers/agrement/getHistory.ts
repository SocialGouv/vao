import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AgrementHistoryItem } from "../../../dto/agrement.dto";

export interface GetHistoryRoute extends BasicRoute {
  method: "GET";
  path: "/agrements/{agrementId}/history/";
  params: {
    agrementId: string;
  };
  response: RouteResponseBody<{ history: AgrementHistoryItem[] }>;
}

export const GetHistoryRouteSchema: RouteSchema<GetHistoryRoute> = {
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
