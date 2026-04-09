import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export interface PostMessageRoute extends BasicRoute {
  method: "POST";
  path: "/agrements/{agrementId}/message";
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
    message: yup.string().max(1000).required(),
  }),
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
