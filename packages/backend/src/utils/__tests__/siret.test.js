const { formatSiren, formatSiret } = require("../siret");

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
  it("should return empty response when input is wrong object", () => {
    expect(formatSiret({ siren: "12345678901234" })).toBe("");
  });
  it("should format SIRET when input is a valid number", () => {
    expect(formatSiret({ siret: 12345678901234 })).toBe("123 456 789 01234");
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
  it("should return empty response when input is wrong object", () => {
    expect(formatSiren({ siret: "12345678901234" })).toBe("");
  });
  it("should format SIREN when input is a valid number", () => {
    expect(formatSiren({ siren: 123456789 })).toBe("123 456 789");
  });
});
