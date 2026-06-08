import { addMinutes } from "@vao/shared-bridge";

export const OtpService = {
  generate() {
    return {
      code: Math.floor(100000 + Math.random() * 900000),
      expiresAt: addMinutes(new Date(), 15),
    };
  },
  isExpired({ otpCodeExpiresAt }: { otpCodeExpiresAt: Date | null }) {
    if (!otpCodeExpiresAt) {
      return true;
    }
    return otpCodeExpiresAt < new Date();
  },
  isLocked({
    otpAttempts,
    otpAttemptsAt,
  }: {
    otpAttempts: number;
    otpAttemptsAt: Date | null;
  }) {
    if (otpAttempts === 3) {
      const unlockAt = addMinutes(otpAttemptsAt ?? null, 15);
      if (unlockAt && unlockAt > new Date()) {
        return { isLocked: true, unlockAt };
      }
    }
    return { isLocked: false };
  },
};
