import { formatLabel } from "./stringUtils";

describe("formatLabel", () => {
  it("should return an empty string by default", () => {
    expect(formatLabel()).toEqual("");
  });

  it("should replace underscores, lowercase, and capitalize first letter", () => {
    expect(formatLabel("HELLO_WORLD")).toEqual("Hello world");
  });

  it("should capitalize a single word", () => {
    expect(formatLabel("hello")).toEqual("Hello");
  });

  it("should lowercase the rest of the string", () => {
    expect(formatLabel("Already Formatted")).toEqual("Already formatted");
  });
});
