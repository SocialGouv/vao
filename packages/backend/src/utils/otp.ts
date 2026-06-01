import { addMinutes } from "@vao/shared-bridge";

export const OtpService = {
  generate() {
    return {
      code: Math.floor(100000 + Math.random() * 900000),
      expiresAt: addMinutes(new Date(), 15),
    };
  },
};
