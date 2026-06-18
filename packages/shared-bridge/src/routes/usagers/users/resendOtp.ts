import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export interface ResendOtpUsagerRoute extends BasicRoute {
  method: "POST";
  path: "/email/resend-otp";
  body: {
    email: string;
  };
  response: RouteResponseBody<{ success: boolean }>;
}

export const ResendOtpUsagerRouteSchema: RouteSchema<ResendOtpUsagerRoute> = {
  body: yup.object({
    email: yup.string().required(),
  }),
};
