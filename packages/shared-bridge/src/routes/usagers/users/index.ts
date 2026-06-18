import {
  type ResendOtpUsagerRoute,
  ResendOtpUsagerRouteSchema,
} from "./resendOtp";
import {
  type VerifyOtpUsagersRoute,
  VerifyOtpUsagersRouteSchema,
} from "./verifyOtp";

export type UserUsagersRoutes = {
  VerifyOtp: VerifyOtpUsagersRoute;
  ResendOtp: ResendOtpUsagerRoute;
};

export const UserUsagersRoutesSchema = {
  ResendOtp: ResendOtpUsagerRouteSchema,
  VerifyOtp: VerifyOtpUsagersRouteSchema,
};
