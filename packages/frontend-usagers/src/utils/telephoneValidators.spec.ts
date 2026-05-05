import { describe, expect, it } from "vitest";

import {
  numTelephoneRegex,
  telephoneYup,
  telephoneYupNullable,
} from "./telephoneValidators";

describe("telephoneValidators", () => {
  describe("numTelephoneRegex", () => {
    it("accepts valid French phone formats", () => {
      expect(numTelephoneRegex.test("0612345678")).toBe(true);
      expect(numTelephoneRegex.test("+33612345678")).toBe(true);
      expect(numTelephoneRegex.test("0033612345678")).toBe(true);
    });

    it("rejects invalid phone formats", () => {
      expect(numTelephoneRegex.test("0012345678")).toBe(false);
      expect(numTelephoneRegex.test("123456789")).toBe(false);
      expect(numTelephoneRegex.test("+3361234567")).toBe(false);
    });
  });

  describe("telephoneYup", () => {
    it("validates a required and valid phone number", async () => {
      await expect(telephoneYup().validate("0612345678")).resolves.toBe(
        "0612345678",
      );
    });

    it("returns required message when value is missing", async () => {
      await expect(telephoneYup().validate("")).rejects.toThrow(
        "Le téléphone est requis",
      );
    });
  });

  describe("telephoneYupNullable", () => {
    it("accepts null and valid value", async () => {
      await expect(telephoneYupNullable().validate(null)).resolves.toBeNull();
      await expect(telephoneYupNullable().validate("0612345678")).resolves.toBe(
        "0612345678",
      );
    });

    it("rejects invalid phone value", async () => {
      await expect(telephoneYupNullable().validate("123")).rejects.toThrow(
        "Format de numéro de téléphone invalide",
      );
    });
  });
});
