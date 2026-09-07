import { describe, expect, it } from "vitest";
import { isValidParams, parsePaginationQuery } from "./pagination";

describe("parsePaginationQuery", () => {
  const sortableTitles = ["name", "siret"] as const;

  it("uses default limit and offset when query keys are missing", () => {
    const parsed = parsePaginationQuery({}, [...sortableTitles]);
    expect(parsed.limit).toBe(10);
    expect(parsed.offset).toBe(0);
    expect(parsed.sort).toBeUndefined();
    expect(parsed.sortDirection).toBe("");
  });

  it("parses numeric limit and offset", () => {
    const parsed = parsePaginationQuery({ limit: "25", offset: "50" }, [
      ...sortableTitles,
    ]);
    expect(parsed.limit).toBe(25);
    expect(parsed.offset).toBe(50);
  });

  it("falls back to defaults for invalid numbers", () => {
    const parsed = parsePaginationQuery({ limit: "abc", offset: "" }, [
      ...sortableTitles,
    ]);
    expect(parsed.limit).toBe(10);
    expect(parsed.offset).toBe(0);
  });

  it("keeps sort only when it is a sortable column", () => {
    expect(
      parsePaginationQuery({ sort: "name" }, [...sortableTitles]).sort,
    ).toBe("name");
    expect(
      parsePaginationQuery({ sort: "unknown" }, [...sortableTitles]).sort,
    ).toBeUndefined();
  });

  it("keeps a valid sortDirection and ignores unknown values", () => {
    expect(
      parsePaginationQuery({ sortDirection: "desc" }, [...sortableTitles])
        .sortDirection,
    ).toBe("desc");
    expect(
      parsePaginationQuery({ sortDirection: "sideways" as "asc" }, [
        ...sortableTitles,
      ]).sortDirection,
    ).toBe("");
  });
});

describe("isValidParams", () => {
  it("returns false for null, empty string or empty array", () => {
    expect(isValidParams(null)).toBe(false);
    expect(isValidParams("")).toBe(false);
    expect(isValidParams([])).toBe(false);
  });

  it("returns true for non-empty values", () => {
    expect(isValidParams("idf")).toBe(true);
    expect(isValidParams(["BROUILLON"])).toBe(true);
    expect(isValidParams(0)).toBe(true);
  });
});
