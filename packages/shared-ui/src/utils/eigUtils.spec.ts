import { describe, expect, it } from "vitest";
import { Categorie, Types } from "../models/eig";
import { mapEigToLabel } from "./eigUtils";

const allEigTypes = [
  ...Object.values(Types[Categorie.VICTIMES]),
  ...Object.values(Types[Categorie.SANTE]),
  ...Object.values(Types[Categorie.SECURITE]),
  ...Object.values(Types[Categorie.FONCTIONNEMENT_ORGANISME]),
];

describe("mapEigToLabel", () => {
  it("has a non-empty label for every EIG type", () => {
    for (const type of allEigTypes) {
      const label = mapEigToLabel[type];
      expect(label).toEqual(expect.any(String));
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("uses distinct codes per category for AUTRE", () => {
    expect(mapEigToLabel[Types[Categorie.VICTIMES].AUTRE]).toBe(
      "Autre, à préciser",
    );
    expect(mapEigToLabel[Types[Categorie.SANTE].AUTRE]).toBe(
      "Autre, à préciser",
    );
    expect(Types[Categorie.VICTIMES].AUTRE).not.toBe(
      Types[Categorie.SANTE].AUTRE,
    );
  });
});
