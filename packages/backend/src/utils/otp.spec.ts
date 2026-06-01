import { OtpService } from "./otp";

describe("OtpService", () => {
  describe("generate", () => {
    it("should generate a 6-digit OTP code", () => {
      const result = OtpService.generate();

      expect(result.code).toBeGreaterThanOrEqual(100000);
      expect(result.code).toBeLessThanOrEqual(999999);
    });

    it("should generate an expiration date 15 minutes in the future", () => {
      const now = new Date();

      const result = OtpService.generate();

      const expectedExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);

      expect(result.expiresAt).not.toBeNull();
      expect(result.expiresAt!.getTime()).toBeCloseTo(
        expectedExpiresAt.getTime(),
        -3, // tolérance de quelques millisecondes
      );
    });

    it("should return code and expiresAt", () => {
      const result = OtpService.generate();

      expect(result).toEqual({
        code: expect.any(Number),
        expiresAt: expect.any(Date),
      });
    });
  });
});
