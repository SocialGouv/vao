import { UserUsagersDto } from "@vao/shared-bridge";

import { UsersService as UsersServiceShared } from "../../shared/users/users.service";

export const UsersService = {
  async resendOtpCode({ email }: { email: string }): Promise<UserUsagersDto> {
    return UsersServiceShared.resendOtpCode({ email, target: "fo" });
  },
  async updateOtp({
    userId,
  }: {
    userId: number;
  }): Promise<{ otpAttempts: number; otpAttemptsAt: Date }> {
    return UsersServiceShared.updateOtp({ target: "fo", userId });
  },
  async verifyOtpCode({
    email,
    code,
    //rememberDevice,
  }: {
    email: string;
    code: string;
    //rememberDevice: boolean;
  }): Promise<UserUsagersDto> {
    return UsersServiceShared.verifyOtpCode({ code, email, target: "fo" });
  },
};
