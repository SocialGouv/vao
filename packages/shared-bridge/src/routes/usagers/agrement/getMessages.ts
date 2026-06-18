import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AgrementMessage } from "../../../dto/agrement.dto";

export interface GetMessagesRoute extends BasicRoute {
  method: "GET";
  path: "/agrements/{agrementId}/messages";
  params: {
    agrementId: string;
  };
  response: RouteResponseBody<{
    count: number;
    messages: AgrementMessage[];
    unreadCount: number;
  }>;
}

export const GetMessagesRouteSchema: RouteSchema<GetMessagesRoute> = {
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
