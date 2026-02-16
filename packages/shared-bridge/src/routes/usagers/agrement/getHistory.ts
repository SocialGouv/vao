import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AgrementHistoryItem } from "../../../constantes/agrement";

export interface GetHistoryRoute extends BasicRoute {
  method: "GET";
  path: "/agrements/history/{agrementId}";
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
