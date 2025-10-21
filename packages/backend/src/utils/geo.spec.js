/*
Test Geo
 */
const getCodeTerritoireByInseeCode = require("./geo");

describe("getCodeTerritoireByInseeCode", () => {
  it("should return first 2 digits for metropolitan France codes", () => {
    expect(getCodeTerritoireByInseeCode({ inseeCode: "75056" })).toBe("75");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "13001" })).toBe("13");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "06088" })).toBe("06");
  });

  it("should return first 3 digits for overseas codes starting with 97", () => {
    expect(getCodeTerritoireByInseeCode({ inseeCode: "97123" })).toBe("971");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "97245" })).toBe("972");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "97356" })).toBe("973");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "97489" })).toBe("974");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "97612" })).toBe("976");
  });

  it("should handle short codes correctly", () => {
    expect(getCodeTerritoireByInseeCode({ inseeCode: "97" })).toBe("97");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "971" })).toBe("971");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "75" })).toBe("75");
  });

  it("should return first 2 characters for Corsica codes (2A/2B)", () => {
    expect(getCodeTerritoireByInseeCode({ inseeCode: "2A004" })).toBe("2A");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "2A200" })).toBe("2A");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "2B033" })).toBe("2B");
    expect(getCodeTerritoireByInseeCode({ inseeCode: "2B300" })).toBe("2B");
  });

  it("should handle empty string", () => {
    expect(getCodeTerritoireByInseeCode({ inseeCode: "" })).toBe("");
  });

  it("should handle non-string input gracefully", () => {
    expect(getCodeTerritoireByInseeCode({ inseeCode: null })).toBe("");
    expect(getCodeTerritoireByInseeCode({ inseeCode: undefined })).toBe("");
    expect(getCodeTerritoireByInseeCode()).toBe(""); // test du cas sans argument
  });
});
