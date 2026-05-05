---
description:
globs:
alwaysApply: true
---

# TU

Les tests unitaire sont présent dans le même dossier que l'implementation et ne s'applique qu'au fonction pure (pas d'accès en base de données ou servic externe)

La documentation "docs/tests/INTEGRATIONS_TEST" décrit le fonctionnement des tests
Les tests sont écrits en typescript (.ts avec import)

# Exemple

```js
import {
  formatFrDateTime,
  formatFrShort,
  formatISOShort,
  isValidFrShort,
  isValidIsoShort,
  parseFrShort,
} from "./date";

describe("formatFrShort", () => {
  it("should return undefined when date is undefined", () => {
    expect(formatFrShort(undefined)).toBeUndefined();
  });

  it("should format a Date in DD/MM/YYYY", () => {
    const frShortFormatter = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const d = new Date(2026, 2, 16, 12, 0, 0);
    expect(formatFrShort(d)).toBe(frShortFormatter.format(d));
  });
});

describe("formatISOShort", () => {
  it("should return undefined when date is undefined", () => {
    expect(formatISOShort(undefined)).toBeUndefined();
  });

  it("should format a Date in YYYY-MM-DD", () => {
    const isoShortFormatter = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const d = new Date(2026, 2, 16);
    expect(formatISOShort(d)).toBe(isoShortFormatter.format(d));
  });

  it("should format a Dayjs instance in YYYY-MM-DD", () => {
    const fromFr = parseFrShort("16/03/2026");
    expect(fromFr).toBeDefined();
    expect(Number.isNaN(fromFr!.toDate().getTime())).toBe(false);
    expect(formatISOShort(fromFr)).toBe("2026-03-16");
  });
});

describe("formatFrDateTime", () => {
  it("should return undefined when input is undefined", () => {
    expect(formatFrDateTime(undefined)).toBeUndefined();
  });

  it("should format an ISO datetime string to DD/MM/YYYY HH:mm", () => {
    const frDateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const d = new Date(2026, 2, 16, 14, 30, 0);
    // @ts-expect-error - test
    expect(formatFrDateTime("2026-03-16T14:30:00")).toBe(
      frDateTimeFormatter.format(d),
    );
  });
});

describe("parseFrShort", () => {
  it("should return undefined when input is undefined or empty", () => {
    expect(parseFrShort(undefined)).toBeUndefined();
    expect(parseFrShort("")).toBeUndefined();
  });

  it("should parse a strict DD/MM/YYYY string", () => {
    const parsed = parseFrShort("16/03/2026");
    expect(parsed).toBeDefined();
    const asDate = parsed!.toDate();
    expect(Number.isNaN(asDate.getTime())).toBe(false);
    expect(asDate.getFullYear()).toBe(2026);
    expect(asDate.getMonth()).toBe(2);
    expect(asDate.getDate()).toBe(16);
  });

  it("should return an invalid Dayjs for non-French-short strings (strict mode)", () => {
    const parsed = parseFrShort("2026-03-16");
    expect(Number.isNaN(parsed!.toDate().getTime())).toBe(true);
  });
});

describe("isValidFrShort", () => {
  it("should return true for a valid French date (DD/MM/YYYY)", () => {
    expect(isValidFrShort("16/03/2026")).toBe(true);
  });

  it("should return false for an ISO date format", () => {
    expect(isValidFrShort("2026-03-16")).toBe(false);
  });

  it("should return false for an incomplete date", () => {
    expect(isValidFrShort("16/03")).toBe(false);
  });

  it("should return false for an invalid calendar date", () => {
    expect(isValidFrShort("32/01/2026")).toBe(false);
  });

  it("should return false for non-date strings", () => {
    expect(isValidFrShort("not-a-date")).toBe(false);
  });

  it("should return false for empty or undefined input", () => {
    expect(isValidFrShort("")).toBe(false);
    expect(isValidFrShort(undefined)).toBe(false);
  });
});

describe("isValidIsoShort", () => {
  it("should return true for a valid ISO date (YYYY-MM-DD)", () => {
    expect(isValidIsoShort("2026-03-16")).toBe(true);
  });

  it("should return false for a French date format", () => {
    expect(isValidIsoShort("16/03/2026")).toBe(false);
  });

  it("should return false for an incomplete date", () => {
    expect(isValidIsoShort("2026-03")).toBe(false);
  });

  it("should return false for an invalid date (e.g., month 13)", () => {
    expect(isValidIsoShort("2026-13-01")).toBe(false);
  });

  it("should return false for non-date strings", () => {
    expect(isValidIsoShort("not-a-date")).toBe(false);
  });

  it("should return false for empty or undefined input", () => {
    expect(isValidIsoShort("")).toBe(false);
    expect(isValidIsoShort(undefined)).toBe(false);
  });
});

```
