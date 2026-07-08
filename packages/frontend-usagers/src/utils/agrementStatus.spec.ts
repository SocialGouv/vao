import { AGREMENT_STATUT, type AgrementDto } from "@vao/shared-bridge";
import { describe, it, expect } from "vitest";
import { hasAgrementRenouvellementEnCours } from "./agrementStatus";

describe("hasAgrementRenouvellementEnCours", () => {
  it("returns false when agrements is null", () => {
    expect(hasAgrementRenouvellementEnCours(null)).toBe(false);
  });

  it("returns false when there are no agrements", () => {
    expect(hasAgrementRenouvellementEnCours([])).toBe(false);
  });

  it("returns true when an agrement is BROUILLON", () => {
    const agrements = [{ statut: AGREMENT_STATUT.BROUILLON }] as AgrementDto[];
    expect(hasAgrementRenouvellementEnCours(agrements)).toBe(true);
  });

  it("returns false when the only agrement is REFUSE", () => {
    const agrements = [{ statut: AGREMENT_STATUT.REFUSE }] as AgrementDto[];
    expect(hasAgrementRenouvellementEnCours(agrements)).toBe(false);
  });

  it("returns false when the only agrement is VALIDE", () => {
    const agrements = [{ statut: AGREMENT_STATUT.VALIDE }] as AgrementDto[];
    expect(hasAgrementRenouvellementEnCours(agrements)).toBe(false);
  });

  it("returns true when at least one agrement is en cours among several", () => {
    const agrements = [
      { statut: AGREMENT_STATUT.REFUSE },
      { statut: AGREMENT_STATUT.A_CORRIGER },
    ] as AgrementDto[];
    expect(hasAgrementRenouvellementEnCours(agrements)).toBe(true);
  });
});
