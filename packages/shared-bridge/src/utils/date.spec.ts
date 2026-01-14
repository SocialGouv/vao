import {
  addDays,
  addMonths,
  isAfter,
  isBefore,
  setFormatDateAndTimeToFRString,
  setFormatDateToFRString,
} from "./date";

describe("setFormatDateToFRString", () => {
  it("should format date to FR string", () => {
    expect(setFormatDateToFRString(new Date(2023, 0, 1))).toBe("01/01/2023");
  });
});

describe("setFormatDateAndTimeToFRString", () => {
  it("should format date and time to FR string", () => {
    expect(setFormatDateAndTimeToFRString(new Date(2023, 0, 1, 9, 5))).toBe(
      "01/01/2023 09:05",
    );
  });
});

describe("isBefore", () => {
  it("should return true if date is before dateToCompare", () => {
    expect(isBefore("2023-01-01", "2023-01-02")).toBe(true);
  });
  it("should return false if date is after dateToCompare", () => {
    expect(isBefore("2023-01-02", "2023-01-01")).toBe(false);
  });
});

describe("isAfter", () => {
  it("should return true if date is after dateToCompare", () => {
    expect(isAfter("2023-01-02", "2023-01-01")).toBe(true);
  });
  it("should return false if date is before dateToCompare", () => {
    expect(isAfter("2023-01-01", "2023-01-02")).toBe(false);
  });
});

describe("addDays", () => {
  it("should add days to date", () => {
    const date = new Date(2023, 0, 1);
    const newDate = addDays(date, 5);
    expect(newDate.getDate()).toBe(6);
  });
});

describe("addMonths", () => {
  it("should add months to date", () => {
    const date = new Date(2023, 0, 1);
    const newDate = addMonths(date, 2);
    expect(newDate.getMonth()).toBe(2);
  });
});
