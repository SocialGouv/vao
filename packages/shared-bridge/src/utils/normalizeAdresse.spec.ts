import { normalizeAdresse } from "./normalizeAdresse";

describe("normalizeAdresse", () => {
  it("should throw if adresse is null", () => {
    expect(() => normalizeAdresse(null)).toThrow(
      "normalizeAdresse: adresse is required",
    );
  });

  it("should throw if adresse is missing required fields", () => {
    expect(() => normalizeAdresse({})).toThrow(
      "normalizeAdresse: adresse is missing required fields",
    );
    expect(() => normalizeAdresse({ label: "foo" })).toThrow(
      "normalizeAdresse: adresse is missing required fields",
    );
  });

  it("should return a valid AdresseDto when all required fields are present", () => {
    const input = {
      codeInsee: "12345",
      codePostal: "75000",
      coordinates: [2.35, 48.85],
      departement: "75",
      label: "12 rue de Paris",
    };
    const result = normalizeAdresse(input);
    expect(result.label).toBe("12 rue de Paris");
    expect(result.codeInsee).toBe("12345");
    expect(result.codePostal).toBe("75000");
    expect(result.departement).toBe("75");
    expect(result.coordinates).toEqual([2.35, 48.85]);
    expect(result.lat).toBe("48.85");
    expect(result.long).toBe("2.35");
  });

  it("should build coordinates from lat/long if coordinates is missing", () => {
    const input = {
      codeInsee: "12345",
      codePostal: "75000",
      departement: "75",
      label: "12 rue de Paris",
      lat: "48.85",
      long: "2.35",
    };
    const result = normalizeAdresse(input);
    expect(result.coordinates).toEqual([2.35, 48.85]);
    expect(result.lat).toBe("48.85");
    expect(result.long).toBe("2.35");
  });

  it("should set lat/long to null if coordinates are missing", () => {
    const input = {
      codeInsee: "12345",
      codePostal: "75000",
      departement: "75",
      label: "12 rue de Paris",
    };
    const result = normalizeAdresse(input);
    expect(result.coordinates).toBeNull();
    expect(result.lat).toBeNull();
    expect(result.long).toBeNull();
  });

  it("should handle coordinates with null values", () => {
    const input = {
      codeInsee: "12345",
      codePostal: "75000",
      coordinates: null,
      departement: "75",
      label: "12 rue de Paris",
    };
    const result = normalizeAdresse(input);
    expect(result.coordinates).toBeNull();
    expect(result.lat).toBeNull();
    expect(result.long).toBeNull();
  });

  it("should throw if a required field is undefined", () => {
    expect(() =>
      normalizeAdresse({
        codeInsee: "12345",
        codePostal: "75000",
        departement: "75",
        label: undefined,
      }),
    ).toThrow("normalizeAdresse: adresse is missing required fields");
  });
});
