import { describe, expect, it } from "vitest";
import { maskEmail } from "./auth";

describe("maskEmail", () => {
  it("masks a standard email", () => {
    expect(maskEmail("jean.dupont@example.fr")).toBe("j***@e***.fr");
  });

  it("returns the original value when empty", () => {
    expect(maskEmail("")).toBe("");
  });

  it("returns the original value when there is no @", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });

  it("returns the original value when the local part is empty", () => {
    expect(maskEmail("@example.fr")).toBe("@example.fr");
  });

  it("returns the original value when the domain has no extension", () => {
    expect(maskEmail("jean@localhost")).toBe("jean@localhost");
  });
});
