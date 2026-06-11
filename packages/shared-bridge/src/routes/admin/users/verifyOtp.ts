import * as yup from "yup";

import type { UserAdminDto } from "../../../dto";
import type { RouteResponseBody, RouteSchema } from "../..";

export interface VerifyOtpAdminRoute {
  method: "POST";
  path: "/users/admin/email/verify-otp";
  body: {
    code: string;
    rememberDevice: string;
    email: string;
  };
  response: RouteResponseBody<{ user: UserAdminDto }>;
}

export const VerifyOtpAdminRouteSchema: RouteSchema<VerifyOtpAdminRoute> = {
  body: yup.object({
    code: yup
      .string()
      .length(6)
      .matches(/^[0-9]+$/)
      .required(),
    email: yup.string().email().required(),
    rememberDevice: yup.string().required(),
  }),
};
