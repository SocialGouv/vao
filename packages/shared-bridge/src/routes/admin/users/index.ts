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
  ResendOtp: ResendOtpAdminRouteSchema,
  VerifyOtp: VerifyOtpAdminRouteSchema,
};
