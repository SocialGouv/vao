import {
  addDays,
  addMonths,
  addYears,
  daysBetween,
  formatFR,
  formatFRDateTime,
  formatFRTime,
  getYear4k,
  isAfter,
  isBefore,
  isBetweenDates,
  parseToISODate,
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

describe("addYears", () => {
  it("should add years to date", () => {
    const date = new Date(2023, 0, 1);
    const newDate = addYears(date, 2);
    expect(newDate?.getFullYear()).toBe(2025);
  });

  it("should return null when date is null", () => {
    expect(addYears(null, 2)).toBeNull();
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

describe("formatFRTime", () => {
  it("should format time to FR string", () => {
    expect(formatFRTime(new Date(2023, 0, 1, 9, 5))).toBe("09:05");
  });
});

describe("getYear4k", () => {
  it("should return year as 4 digits", () => {
    expect(getYear4k(new Date(1999, 0, 1))).toBe("1999");
  });
});

describe("parseToISODate", () => {
  it("should return null when input is null", () => {
    expect(parseToISODate(null)).toBeNull();
  });

  it("should convert JJ/MM/AAAA to AAAA-MM-JJ", () => {
    expect(parseToISODate("01/02/2023")).toBe("2023-02-01");
  });

  it("should keep parts even without padding", () => {
    expect(parseToISODate("1/2/2023")).toBe("2023-2-1");
  });
});
