import { describe, expect, it } from "vitest";

import type { SiteSimilariteResult, SiteSimilariteType } from "@vao/shared-bridge";

import {
  buildSimilarityGroups,
  highlightLabelSegments,
  similarLabelSegments,
} from "./addressSimilarity";

function makeItem(
  label: string | null,
  type: SiteSimilariteType,
  nomSiteOfficiel: string | null = "Gîte voisin",
): SiteSimilariteResult {
  return {
    adresse: label ? { label } : null,
    similarite: type,
    nomSiteOfficiel,
    nomSite: null,
  } as unknown as SiteSimilariteResult;
}

describe("similarLabelSegments", () => {
  it("met en gras le numéro de voie pour numeroVoie", () => {
    const segments = similarLabelSegments(
      makeItem("134 rue Gilles de Montal, 67730 La Vancelle", "numeroVoie"),
      "numeroVoie",
    );

    expect(segments).toEqual([
      { text: "134", bold: true },
      { text: " rue Gilles de Montal, 67730 La Vancelle", bold: false },
      { text: " (Gîte voisin)", bold: false },
    ]);
  });

  it("met en gras le type de voie pour typeVoie", () => {
    const segments = similarLabelSegments(
      makeItem("12 chemin des Prés, 67730 La Vancelle", "typeVoie"),
      "typeVoie",
    );

    expect(segments).toEqual([
      { text: "12 ", bold: false },
      { text: "chemin", bold: true },
      { text: " des Prés, 67730 La Vancelle", bold: false },
      { text: " (Gîte voisin)", bold: false },
    ]);
  });

  it("est insensible à la casse pour le type de voie", () => {
    const segments = similarLabelSegments(
      makeItem("12 RUE des Prés, 67730 La Vancelle", "typeVoie"),
      "typeVoie",
    );

    expect(segments.some((seg) => seg.bold && seg.text === "RUE")).toBe(true);
  });

  it("met en gras l'adresse entière pour adresseComplete", () => {
    const segments = similarLabelSegments(
      makeItem("12 rue des Prés, 67730 La Vancelle", "adresseComplete", "Gîte des Pins"),
      "adresseComplete",
    );

    expect(segments).toEqual([
      { text: "12 rue des Prés, 67730 La Vancelle", bold: true },
      { text: " (Gîte des Pins)", bold: false },
    ]);
  });

  it("ne met rien en gras quand le numéro est absent", () => {
    const segments = similarLabelSegments(
      makeItem("Chemin du Lac 26190 Bouvante", "numeroVoie"),
      "numeroVoie",
    );

    expect(segments.every((seg) => !seg.bold)).toBe(true);
  });

  it("ne met rien en gras quand le type de voie est absent", () => {
    const segments = similarLabelSegments(
      makeItem("134 Champ de Mars, 75007 Paris", "typeVoie"),
      "typeVoie",
    );

    expect(segments.every((seg) => !seg.bold)).toBe(true);
  });

  it("retourne uniquement le nom sans gras quand il n'y a pas d'adresse", () => {
    const segments = similarLabelSegments(makeItem(null, "adresseComplete"), "adresseComplete");

    expect(segments).toEqual([{ text: "Gîte voisin", bold: false }]);
  });

  it("ne met jamais le nom en gras", () => {
    const segments = similarLabelSegments(
      makeItem("12 rue des Prés, 67730 La Vancelle", "adresseComplete", "Gîte des Pins"),
      "adresseComplete",
    );

    const nameSegment = segments[segments.length - 1];
    expect(nameSegment).toEqual({ text: " (Gîte des Pins)", bold: false });
  });
});

describe("highlightLabelSegments", () => {
  it("met en gras le numéro pour numeroVoie", () => {
    expect(
      highlightLabelSegments("134 rue Gilles de Montal, 67730 La Vancelle", "numeroVoie"),
    ).toEqual([
      { text: "134", bold: true },
      { text: " rue Gilles de Montal, 67730 La Vancelle", bold: false },
    ]);
  });

  it("met en gras le type de voie pour typeVoie", () => {
    expect(
      highlightLabelSegments("12 chemin des Prés, 67730 La Vancelle", "typeVoie"),
    ).toEqual([
      { text: "12 ", bold: false },
      { text: "chemin", bold: true },
      { text: " des Prés, 67730 La Vancelle", bold: false },
    ]);
  });

  it("met en gras l'adresse entière pour adresseComplete", () => {
    expect(
      highlightLabelSegments("12 rue des Prés, 67730 La Vancelle", "adresseComplete"),
    ).toEqual([{ text: "12 rue des Prés, 67730 La Vancelle", bold: true }]);
  });

  it("ne met rien en gras quand le numéro est absent", () => {
    const segments = highlightLabelSegments("Chemin du Lac 26190 Bouvante", "numeroVoie");
    expect(segments.every((seg) => !seg.bold)).toBe(true);
  });

  it("retourne une liste vide pour un libellé vide", () => {
    expect(highlightLabelSegments("", "numeroVoie")).toEqual([]);
  });
});

describe("buildSimilarityGroups", () => {
  it("retourne les noms de lieux sans adresse entre parenthèses", () => {
    const groups = buildSimilarityGroups([
      makeItem("12 rue des Prés, 67730 La Vancelle", "nomLieu", "Gîte des Pins"),
      makeItem("12 rue des Prés, 67730 La Vancelle", "nomLieu", "Gîte Les Pins"),
    ]);

    const nomLieuGroup = groups.find((group) => group.type === "nomLieu");
    expect(nomLieuGroup?.names).toEqual(["Gîte des Pins", "Gîte Les Pins"]);
  });

  it("dédoublonne les noms de lieux identiques", () => {
    const groups = buildSimilarityGroups([
      makeItem("12 rue des Prés, 67730 La Vancelle", "nomLieu", "Gîte des Pins"),
      makeItem("12 rue des Prés, 67730 La Vancelle", "nomLieu", "Gîte des Pins"),
    ]);

    const nomLieuGroup = groups.find((group) => group.type === "nomLieu");
    expect(nomLieuGroup?.names).toEqual(["Gîte des Pins"]);
  });

  it("met « noms de lieux » en gras dans le titre nomLieu", () => {
    const groups = buildSimilarityGroups([
      makeItem("12 rue des Prés, 67730 La Vancelle", "nomLieu", "Gîte des Pins"),
    ]);

    const nomLieuGroup = groups.find((group) => group.type === "nomLieu");
    expect(nomLieuGroup?.title).toEqual([
      { text: "Des ", bold: false },
      { text: "noms de lieux", bold: true },
      {
        text: " différents ont été renseignés par d’autres organismes à cette adresse :",
        bold: false,
      },
    ]);
  });

  it("met « Le numéro de la voie » en gras dans le titre numeroVoie", () => {
    const groups = buildSimilarityGroups([
      makeItem("134 rue Gilles de Montal, 67730 La Vancelle", "numeroVoie"),
    ]);

    const numeroVoieGroup = groups.find((group) => group.type === "numeroVoie");
    expect(numeroVoieGroup?.title[0]).toEqual({
      text: "Le numéro de la voie",
      bold: true,
    });
  });
});
