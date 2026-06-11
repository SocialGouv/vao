import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export interface ResendOtpAdminRoute extends BasicRoute {
  method: "POST";
  path: "/email/resend-otp";
  body: {
    email: string;
  };
  response: RouteResponseBody<{ success: boolean }>;
}

export const ResendOtpAdminRouteSchema: RouteSchema<ResendOtpAdminRoute> = {
  body: yup.object({
    email: yup.string().email().required(),
  }),
};
