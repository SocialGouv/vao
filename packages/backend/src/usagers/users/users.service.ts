import { USER_TARGET, UserUsagersDto } from "@vao/shared-bridge";

import { UsersService as UsersServiceShared } from "../../shared/users/users.service";

const target = USER_TARGET.FO;
export const UsersService = {
  async resendOtpCode({ email }: { email: string }): Promise<UserUsagersDto> {
    return UsersServiceShared.resendOtpCode({ email, target });
  },
  async updateOtp({
    userId,
  }: {
    userId: number;
  }): Promise<{ otpAttempts: number; otpAttemptsAt: Date }> {
    return UsersServiceShared.updateOtp({ target, userId });
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
    return UsersServiceShared.verifyOtpCode({ code, email, target });
  },
};
