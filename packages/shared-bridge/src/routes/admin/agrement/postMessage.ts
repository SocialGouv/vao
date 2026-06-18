import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export interface PostMessageRoute extends BasicRoute {
  method: "POST";
  path: "/admin/agrements/{agrementId}/message";
  params: {
    agrementId: string;
  };
  body: {
    message: string;
  };
  response: RouteResponseBody<{ success: boolean }>;
}

export const PostMessageRouteSchema: RouteSchema<PostMessageRoute> = {
  body: yup.object({
    message: yup.string().min(1).max(1000).required(),
  }),
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
