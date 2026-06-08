import {
  type VerifyOtpUsagersRoute,
  VerifyOtpUsagersRouteSchema,
} from "./verifyOtp";

export type UserUsagersRoutes = {
  VerifyOtp: VerifyOtpUsagersRoute;
};

export const UserUsagersRoutesSchema = {
  VerifyOtp: VerifyOtpUsagersRouteSchema,
};
