import { USER_TARGET, UserUsagersDto } from "@vao/shared-bridge";

import { UsersService as UsersServiceShared } from "../../shared/users/users.service";

const target = USER_TARGET.FO;
export const UsersService = {
  async resendOtpCode({ email }: { email: string }): Promise<UserUsagersDto> {
    return UsersServiceShared.resendOtpCode({ email, target });
  },
  async updateOtp({ userId }: { userId: number }): Promise<{
    otpAttempts: number;
    otpAttemptsAt: Date;
    otpCodeExpiresAt: Date;
  }> {
    return UsersServiceShared.updateOtp({ target, userId });
  },
  async verifyOtpCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<UserUsagersDto> {
    return UsersServiceShared.verifyOtpCode({ code, email, target });
  },
};
