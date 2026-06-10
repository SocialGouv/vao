import { UserAdminDto, UserUsagersDto } from "@vao/shared-bridge";

import { UsersService as UsersServiceShared } from "../../shared/users/users.service";

export const UsersService = {
  async updateOtpCode({
    userId,
  }: {
    userId: number;
  }): Promise<{ otpAttempts: number; otpAttemptsAt: Date }> {
    return UsersServiceShared.updateOtpCode({ from: "fo", userId });
  },
  async verifyOtpCode({
    email,
    code,
    //rememberDevice,
  }: {
    email: string;
    code: string;
    //rememberDevice: boolean;
  }): Promise<UserUsagersDto | UserAdminDto> {
    return UsersServiceShared.verifyOtpCode({ code, email, from: "fo" });
  },
};
