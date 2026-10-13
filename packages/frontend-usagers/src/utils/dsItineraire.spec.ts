import { describe, expect, it } from "vitest";

import {
  MESSAGE_DATE_DEBUT_AVANT_SEJOUR,
  MESSAGE_DATE_DEPASSE_SEJOUR,
  MESSAGE_DATE_FIN_PRECEDE_DEBUT,
  MESSAGE_DATE_LENDEMAIN,
  dateDebutCoherenceError,
  dateFinCoherenceError,
  recalcDatesLendemain,
  resolveSiteId,
  sortByDateDebut,
} from "./dsItineraire";
import type { DSItineraireBlock } from "./dsItineraire";

function block({
  id,
  siteId = "site-uuid",
  dateDebut,
  dateFin,
}: {
  id: string;
  siteId?: string;
  dateDebut?: string;
  dateFin?: string;
}): DSItineraireBlock {
  return { id, siteId, dateDebut: dateDebut ?? "", dateFin: dateFin ?? "" };
}

describe("sortByDateDebut", () => {
  it("returns an empty array for an empty input", () => {
    expect(sortByDateDebut([])).toEqual([]);
  });

  it("keeps an already sorted list unchanged", () => {
    const items = [
      { dateDebut: "2024-08-01", x: 1 },
      { dateDebut: "2024-08-04", x: 2 },
    ];
    const sorted = sortByDateDebut(items);
    expect(sorted.map((i) => i.dateDebut)).toEqual([
      "2024-08-01",
      "2024-08-04",
    ]);
  });

  it("sorts a reverse ordered list ascending", () => {
    const sorted = sortByDateDebut([
      { dateDebut: "2024-08-04", x: 2 },
      { dateDebut: "2024-08-01", x: 1 },
    ]);
    expect(sorted.map((i) => i.dateDebut)).toEqual([
      "2024-08-01",
      "2024-08-04",
    ]);
  });

  it("sorts an unsorted list chronologically", () => {
    const sorted = sortByDateDebut([
      { dateDebut: "2024-08-07", x: 3 },
      { dateDebut: "2024-08-01", x: 1 },
      { dateDebut: "2024-08-04", x: 2 },
    ]);
    expect(sorted.map((i) => i.dateDebut)).toEqual([
      "2024-08-01",
      "2024-08-04",
      "2024-08-07",
    ]);
  });

  it("does not mutate the input array", () => {
    const items = [
      { dateDebut: "2024-08-04", x: 2 },
      { dateDebut: "2024-08-01", x: 1 },
    ];
    sortByDateDebut(items);
    expect(items.map((i) => i.dateDebut)).toEqual(["2024-08-04", "2024-08-01"]);
  });
});

describe("resolveSiteId", () => {
  const sites = [
    { id: 10, siteId: "site-10" },
    { id: 20, siteId: "site-20" },
  ];

  it("returns the siteId matching the given hebergement id", () => {
    expect(resolveSiteId(sites, 20)).toBe("site-20");
    expect(resolveSiteId(sites, 10)).toBe("site-10");
  });

  it("returns an empty string when no site matches", () => {
    expect(resolveSiteId(sites, 999)).toBe("");
  });

  it("returns an empty string for an empty site list", () => {
    expect(resolveSiteId([], 10)).toBe("");
  });
});

describe("recalcDatesLendemain", () => {
  const debutSejour = "2024-08-01";

  it("returns an empty array for an empty input", () => {
    expect(recalcDatesLendemain([], debutSejour, 0)).toEqual([]);
  });

  it("sets the first block dateDebut to the sejour start date", () => {
    const result = recalcDatesLendemain([block({ id: "0", dateFin: "2024-08-03" })], debutSejour, 0);
    expect(result[0]!.dateDebut).toBe("2024-08-01");
  });

  it("recomputes following blocks one day after the previous dateFin", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-03" }),
      block({ id: "1", dateDebut: "", dateFin: "2024-08-06" }),
      block({ id: "2", dateDebut: "", dateFin: "2024-08-10" }),
    ];
    const result = recalcDatesLendemain(blocks, debutSejour, 1);
    expect(result.map((b) => b.dateDebut)).toEqual([
      "2024-08-01",
      "2024-08-04",
      "2024-08-07",
    ]);
  });

  it("recomputes from fromIndex forward and leaves previous blocks untouched", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-03" }),
      block({ id: "1", dateDebut: "2024-08-02", dateFin: "2024-08-06" }),
      block({ id: "2", dateDebut: "", dateFin: "2024-08-10" }),
    ];
    const result = recalcDatesLendemain(blocks, debutSejour, 1);
    expect(result.map((b) => b.dateDebut)).toEqual([
      "2024-08-01",
      "2024-08-04",
      "2024-08-07",
    ]);
  });

  it("handles a month boundary in the lendemain rule", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-30", dateFin: "2024-08-31" }),
      block({ id: "1", dateDebut: "", dateFin: "2024-09-03" }),
    ];
    const result = recalcDatesLendemain(blocks, "2024-08-30", 0);
    expect(result[0]!.dateDebut).toBe("2024-08-30");
    expect(result[1]!.dateDebut).toBe("2024-09-01");
  });

  it("does not mutate the input blocks", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-03" }),
      block({ id: "1", dateDebut: "", dateFin: "2024-08-06" }),
    ];
    recalcDatesLendemain(blocks, debutSejour, 1);
    expect(blocks[0]!.dateDebut).toBe("2024-08-01");
    expect(blocks[1]!.dateDebut).toBe("");
  });
});

describe("dateDebutCoherenceError", () => {
  const debutSejour = "2024-08-01";

  it("returns an empty string when the block or its dateDebut is missing", () => {
    expect(dateDebutCoherenceError([], debutSejour, 0)).toBe("");
    expect(
      dateDebutCoherenceError([block({ id: "0" })], debutSejour, 0),
    ).toBe("");
  });

  it("flags a first block starting before the sejour start date", () => {
    expect(
      dateDebutCoherenceError(
        [block({ id: "0", dateDebut: "2024-07-31" })],
        debutSejour,
        0,
      ),
    ).toBe(MESSAGE_DATE_DEBUT_AVANT_SEJOUR);
  });

  it("accepts a first block starting on the sejour start date", () => {
    expect(
      dateDebutCoherenceError(
        [block({ id: "0", dateDebut: "2024-08-01" })],
        debutSejour,
        0,
      ),
    ).toBe("");
  });

  it("flags a following block whose dateDebut is not the lendemain of the previous dateFin", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-03" }),
      block({ id: "1", dateDebut: "2024-08-05" }),
    ];
    expect(dateDebutCoherenceError(blocks, debutSejour, 1)).toBe(
      MESSAGE_DATE_LENDEMAIN,
    );
  });

  it("flags a following block when the previous dateFin is missing", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-01" }),
      block({ id: "1", dateDebut: "2024-08-04" }),
    ];
    expect(dateDebutCoherenceError(blocks, debutSejour, 1)).toBe(
      MESSAGE_DATE_LENDEMAIN,
    );
  });

  it("accepts a following block starting on the lendemain of the previous dateFin", () => {
    const blocks = [
      block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-03" }),
      block({ id: "1", dateDebut: "2024-08-04" }),
    ];
    expect(dateDebutCoherenceError(blocks, debutSejour, 1)).toBe("");
  });
});

describe("dateFinCoherenceError", () => {
  const finSejour = "2024-08-10";

  it("returns an empty string when the block or its dateFin is missing", () => {
    expect(dateFinCoherenceError([], finSejour, 0)).toBe("");
    expect(dateFinCoherenceError([block({ id: "0" })], finSejour, 0)).toBe("");
  });

  it("flags a dateFin beyond the sejour end date", () => {
    expect(
      dateFinCoherenceError(
        [block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-11" })],
        finSejour,
        0,
      ),
    ).toBe(MESSAGE_DATE_DEPASSE_SEJOUR);
  });

  it("flags a dateFin before the block dateDebut", () => {
    expect(
      dateFinCoherenceError(
        [block({ id: "0", dateDebut: "2024-08-05", dateFin: "2024-08-03" })],
        finSejour,
        0,
      ),
    ).toBe(MESSAGE_DATE_FIN_PRECEDE_DEBUT);
  });

  it("accepts a valid dateFin within the sejour period", () => {
    expect(
      dateFinCoherenceError(
        [block({ id: "0", dateDebut: "2024-08-01", dateFin: "2024-08-10" })],
        finSejour,
        0,
      ),
    ).toBe("");
  });
});
