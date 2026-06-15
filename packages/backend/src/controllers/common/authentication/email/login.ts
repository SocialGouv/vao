import { FeatureFlagName, USER_TARGET, UserDto } from "@vao/shared-bridge";
import { Request } from "express";

import { FeatureFlagService } from "../../../../services/featureFlagService";
import { OtpService } from "../../../../utils/otp";
import { isTrustedDevice } from "../isTrustDevice";

export async function checkActionsOtp({
  req,
  user,
  target,
}: {
  req: Request;
  user: UserDto;
  target: (typeof USER_TARGET)[keyof typeof USER_TARGET];
}): Promise<{
  featureFlags: Record<string, boolean>;
  isUpdateOtpNecessary: boolean;
  requires2FA: boolean;
}> {
  const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();

  const requires2FAConfig = await FeatureFlagService.isFeatureAvailable(
    FeatureFlagName.AUTH_2FA,
  );

  const isTrustToken = isTrustedDevice({
    req,
    target,
    userId: Number(user.id),
  });
  const requires2FA = requires2FAConfig && !isTrustToken;
  let isUpdateOtpNecessary = false;

  if (requires2FA) {
    const { isLocked } = OtpService.isLocked({
      otpAttempts: user.otpAttempts ?? 0,

      otpAttemptsAt: user.otpAttemptsAt ?? null,
    });

    const isExpired = OtpService.isExpired({
      otpCodeExpiresAt: user.otpCodeExpiresAt ?? null,
    });
    isUpdateOtpNecessary = !isLocked && isExpired;
  }
  return {
    featureFlags,
    isUpdateOtpNecessary,
    requires2FA,
  };
}
