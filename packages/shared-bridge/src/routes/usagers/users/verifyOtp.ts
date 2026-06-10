import * as yup from "yup";

import type { UserUsagersDto } from "../../../dto";
import type { RouteResponseBody, RouteSchema } from "../..";

export interface VerifyOtpUsagersRoute {
  method: "POST";
  path: "/users/email/verify-otp";
  body: {
    code: string;
    rememberDevice: string;
    email: string;
  };
  response: RouteResponseBody<{ user: UserUsagersDto }>;
}

export const VerifyOtpUsagersRouteSchema: RouteSchema<VerifyOtpUsagersRoute> = {
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
