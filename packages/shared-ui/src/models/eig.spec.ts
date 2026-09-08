import { describe, expect, it } from "vitest";
import { Categorie, Types, isTypeActive } from "./eig";

describe("Types", () => {
  it("exposes a defined map for every Categorie key", () => {
    expect(Types[Categorie.VICTIMES].VIOLS).toBe("VIOLS");
    expect(Types[Categorie.SANTE].EPIDEMIE).toBe("EPIDEMIE");
    expect(Types[Categorie.SECURITE].VOLS).toBe("VOLS");
    expect(Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE).toBe(
      "AUTRE__FONCTIONNEMENT_ORGANISME",
    );
  });
});

describe("isTypeActive", () => {
  it("returns false for VIOLS", () => {
    expect(isTypeActive(Types[Categorie.VICTIMES].VIOLS)).toBe(false);
  });

  it("returns true for other victim types", () => {
    expect(isTypeActive(Types[Categorie.VICTIMES].VIOLENCES_SEXUELLES)).toBe(
      true,
    );
  });

  it("returns true for types in other categories", () => {
    expect(isTypeActive(Types[Categorie.SANTE].EPIDEMIE)).toBe(true);
    expect(isTypeActive(Types[Categorie.SECURITE].FUGUE)).toBe(true);
  });
});
