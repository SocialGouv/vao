import {
  addDays,
  addMonths,
  daysBetween,
  formatFR,
  formatFRDateTime,
  isAfter,
  isBefore,
  isBetweenDates,
} from "./date";

describe("setFormatDateToFRString", () => {
  it("should format date to FR string", () => {
    expect(formatFR(new Date(2023, 0, 1))).toBe("01/01/2023");
  });
});

describe("setFormatDateAndTimeToFRString", () => {
  it("should format date and time to FR string", () => {
    expect(formatFRDateTime(new Date(2023, 0, 1, 21, 5))).toBe(
      "01/01/2023 21:05",
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

describe("daysBetween", () => {
  it("should return number of days between two dates", () => {
    expect(daysBetween("2023-01-01", "2023-01-05")).toBe(4);
  });

  it("should return 0 if dates are the same", () => {
    expect(daysBetween("2023-01-01", "2023-01-01")).toBe(0);
  });

  it("should round up partial days", () => {
    const date1 = new Date(2023, 0, 1, 0, 0);
    const date2 = new Date(2023, 0, 2, 12, 0); // 1.5 days
    expect(daysBetween(date1, date2)).toBe(2);
  });

  it("should return negative value if date2 is before date1", () => {
    expect(daysBetween("2023-01-05", "2023-01-01")).toBe(-4);
  });
});

describe("isBetweenDates", () => {
  it("should return true if date is between start and end", () => {
    expect(isBetweenDates("2023-01-05", "2023-01-01", "2023-01-10")).toBe(true);
  });

  it("should return false if date is before start", () => {
    expect(isBetweenDates("2022-12-31", "2023-01-01", "2023-01-10")).toBe(
      false,
    );
  });

  it("should return false if date is after end", () => {
    expect(isBetweenDates("2023-01-11", "2023-01-01", "2023-01-10")).toBe(
      false,
    );
  });

  it("should return true if date is equal to start", () => {
    expect(isBetweenDates("2023-01-01", "2023-01-01", "2023-01-10")).toBe(true);
  });

  it("should return true if date is equal to end", () => {
    expect(isBetweenDates("2023-01-10", "2023-01-01", "2023-01-10")).toBe(true);
  });
});
