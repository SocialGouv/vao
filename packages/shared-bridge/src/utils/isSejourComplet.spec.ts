import { isSejourComplet } from "./isSejourComplet";

describe("isSejourComplet", () => {
  it("returns false when there are no hebergements", () => {
    expect(isSejourComplet([], "2024-08-01", "2024-08-10")).toBe(false);
  });

  it("returns false when dateDebut or dateFin is missing", () => {
    expect(
      isSejourComplet([{ dateDebut: "2024-08-01" }], null, "2024-08-10"),
    ).toBe(false);
    expect(
      isSejourComplet([{ dateDebut: "2024-08-01" }], "2024-08-01", null),
    ).toBe(false);
  });

  it("returns true for a single hebergement covering the whole sejour", () => {
    const hebergements = [{ dateDebut: "2024-08-01", dateFin: "2024-08-10" }];
    expect(isSejourComplet(hebergements, "2024-08-01", "2024-08-10")).toBe(
      true,
    );
  });

  it("returns true for itinérant hebergements following the lendemain rule", () => {
    const hebergements = [
      { dateDebut: "2024-08-01", dateFin: "2024-08-03" },
      { dateDebut: "2024-08-04", dateFin: "2024-08-06" },
      { dateDebut: "2024-08-07", dateFin: "2024-08-10" },
    ];
    expect(isSejourComplet(hebergements, "2024-08-01", "2024-08-10")).toBe(
      true,
    );
  });

  it("returns false when the first hebergement does not start on dateDebut", () => {
    const hebergements = [{ dateDebut: "2024-08-02", dateFin: "2024-08-10" }];
    expect(isSejourComplet(hebergements, "2024-08-01", "2024-08-10")).toBe(
      false,
    );
  });

  it("returns false when the last hebergement does not end on dateFin", () => {
    const hebergements = [{ dateDebut: "2024-08-01", dateFin: "2024-08-09" }];
    expect(isSejourComplet(hebergements, "2024-08-01", "2024-08-10")).toBe(
      false,
    );
  });

  it("returns false when a hebergement overlaps the previous one (same day)", () => {
    const hebergements = [
      { dateDebut: "2024-08-01", dateFin: "2024-08-03" },
      { dateDebut: "2024-08-03", dateFin: "2024-08-10" },
    ];
    expect(isSejourComplet(hebergements, "2024-08-01", "2024-08-10")).toBe(
      false,
    );
  });

  it("returns false when there is a gap between two hebergements", () => {
    const hebergements = [
      { dateDebut: "2024-08-01", dateFin: "2024-08-03" },
      { dateDebut: "2024-08-05", dateFin: "2024-08-10" },
    ];
    expect(isSejourComplet(hebergements, "2024-08-01", "2024-08-10")).toBe(
      false,
    );
  });
});
