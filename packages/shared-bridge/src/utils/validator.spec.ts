import { validateId } from "./validator";

describe("validateId", () => {
  it("should return a number id and null error for a numeric string", () => {
    expect(validateId("123")).toEqual({ error: null, id: 123 });
  });

  it("should return a number id and null error for a numeric string with spaces", () => {
    expect(validateId("  42 ")).toEqual({ error: null, id: 42 });
  });

  it("should return undefined id and an error for a non-numeric string", () => {
    const result = validateId("abc");
    expect(result.id).toBeUndefined();
    expect(result.error).toEqual(expect.any(String));
    expect(result.error).not.toBe("");
  });

  it("should return undefined id and an error for an empty string", () => {
    const result = validateId("");
    expect(result.id).toBeUndefined();
    expect(result.error).toEqual(expect.any(String));
    expect(result.error).not.toBe("");
  });
});
