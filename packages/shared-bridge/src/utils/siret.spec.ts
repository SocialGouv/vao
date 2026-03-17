import { formatSiren, formatSiret } from "./siret";

describe("formatSiret", () => {
  it("should format SIRET if it's valid", () => {
    expect(formatSiret({ siret: "12345678901234" })).toBe("123 456 789 01234");
  });
  it("should return input when it isn't valid", () => {
    expect(formatSiret({ siret: "123456789ABCDE" })).toBe("123456789ABCDE");
  });
  it("should return input when it isn't a Siret lenght", () => {
    expect(formatSiret({ siret: "123456789" })).toBe("123456789");
  });
  it("should format SIRET when input is a valid number", () => {
    expect(formatSiret({ siret: 12345678901234 })).toBe("123 456 789 01234");
  });
  it("should return empty string when siret is undefined", () => {
    expect(formatSiret({ siret: undefined })).toBe("");
  });
  it("should return empty string when siret is null", () => {
    expect(formatSiret({ siret: null })).toBe("");
  });
  it("should return empty string when siret is an empty string", () => {
    expect(formatSiret({ siret: "" })).toBe("");
  });
  it("should return empty string when siret is 0", () => {
    expect(formatSiret({ siret: 0 })).toBe("");
  });
  it("should return input when it has the right length but contains spaces", () => {
    expect(formatSiret({ siret: "123456789 1234" })).toBe("123456789 1234");
  });
  it("should preserve leading zeros when siret is a string", () => {
    expect(formatSiret({ siret: "00123456789012" })).toBe("001 234 567 89012");
  });
});
describe("formatSiren", () => {
  it("should format SIREN if it's valid", () => {
    expect(formatSiren({ siren: "123456789" })).toBe("123 456 789");
  });
  it("should return entry when it isn't valid", () => {
    expect(formatSiren({ siren: "12345ABCDE" })).toBe("12345ABCDE");
  });
  it("should return entry when it isn't a Siren", () => {
    expect(formatSiren({ siren: "12345678901234" })).toBe("12345678901234");
  });
  it("should format SIREN when input is a valid number", () => {
    expect(formatSiren({ siren: 123456789 })).toBe("123 456 789");
  });
  it("should return empty string when siren is undefined", () => {
    expect(formatSiren({ siren: undefined })).toBe("");
  });
  it("should return empty string when siren is null", () => {
    expect(formatSiren({ siren: null })).toBe("");
  });
  it("should return empty string when siren is an empty string", () => {
    expect(formatSiren({ siren: "" })).toBe("");
  });
  it("should return empty string when siren is 0", () => {
    expect(formatSiren({ siren: 0 })).toBe("");
  });
  it("should return input when it has the right length but contains a separator", () => {
    expect(formatSiren({ siren: "123 456789" })).toBe("123 456789");
  });
  it("should preserve leading zeros when siren is a string", () => {
    expect(formatSiren({ siren: "001234567" })).toBe("001 234 567");
  });
});
