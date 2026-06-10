import {
  type VerifyOtpAdminRoute,
  VerifyOtpAdminRouteSchema,
} from "./verifyOtp";

export type UserAdminRoutes = {
  VerifyOtp: VerifyOtpAdminRoute;
};

export const UserAdminRoutesSchema = {
  VerifyOtp: VerifyOtpAdminRouteSchema,
};
