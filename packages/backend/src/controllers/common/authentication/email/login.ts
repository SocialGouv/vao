import { FeatureFlagName, UserDto } from "@vao/shared-bridge";

import { FeatureFlagService } from "../../../../services/featureFlagService";
import { OtpService } from "../../../../utils/otp";

export async function checkActionsOtp({ user }: { user: UserDto }): Promise<{
  featureFlags: Record<string, boolean>;
  isUpdateOtpNecessary: boolean;
  requires2FA: boolean;
}> {
  const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();

  const requires2FA = await FeatureFlagService.isFeatureAvailable(
    FeatureFlagName.AUTH_2FA,
  );
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
