import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export interface PatchMessagesRoute extends BasicRoute {
  method: "PATCH";
  path: "/admin/agrements/{agrementId}/messages/read";
  params: {
    agrementId: string;
  };
  response: RouteResponseBody<{ count: number }>;
}

export const PatchMessagesRouteSchema: RouteSchema<PatchMessagesRoute> = {
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
