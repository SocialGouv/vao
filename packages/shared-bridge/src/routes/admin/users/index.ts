import {
  type ResendOtpAdminRoute,
  ResendOtpAdminRouteSchema,
} from "./resendOtp";
import {
  type VerifyOtpAdminRoute,
  VerifyOtpAdminRouteSchema,
} from "./verifyOtp";

export type UserAdminRoutes = {
  VerifyOtp: VerifyOtpAdminRoute;
  ResendOtp: ResendOtpAdminRoute;
};

export const UserAdminRoutesSchema = {
  ResentOtp: ResendOtpAdminRouteSchema,
  VerifyOtp: VerifyOtpAdminRouteSchema,
};
