import { UserAdminDto } from "@vao/shared-bridge";

import { UsersService as UsersServiceShared } from "../../shared/users/users.service";

export const UsersService = {
  async resendOtpCode({ email }: { email: string }): Promise<UserAdminDto> {
    return UsersServiceShared.resendOtpCode({ email, target: "bo" });
  },
  async updateOtp({ userId }: { userId: number }): Promise<{
    otpAttempts: number;
    otpAttemptsAt: Date;
  }> {
    return UsersServiceShared.updateOtp({ target: "bo", userId });
  },
  async verifyOtpCode({
    email,
    code,
    //rememberDevice,
  }: {
    email: string;
    code: string;
    //rememberDevice: boolean;
  }): Promise<UserAdminDto> {
    return UsersServiceShared.verifyOtpCode({ code, email, target: "bo" });
  },
};
