import {
  bigrams,
  classifySiteSimilarite,
  diceSimilarity,
} from "./hebergements.similarites";

describe("hebergements.similarites", () => {
  describe("diceSimilarity", () => {
    it("renvoie 1 pour des chaînes identiques", () => {
      expect(diceSimilarity("gilles de montal", "gilles de montal")).toBe(1);
    });

    it("renvoie 0 pour des chaînes disjointes", () => {
      expect(diceSimilarity("abcd", "efgh")).toBe(0);
    });

    it("produit des bigrammes normalisés", () => {
      expect(bigrams("Mont")).toEqual(["mo", "on", "nt"]);
    });

    it("est tolérant à une typo légère", () => {
      const score = diceSimilarity("gille de montal", "gilles de montal");
      expect(score).toBeGreaterThanOrEqual(0.85);
    });

    it("distingue deux rues différentes", () => {
      const score = diceSimilarity("gilles de montal", "des champs");
      expect(score).toBeLessThan(0.85);
    });
  });

  describe("classifySiteSimilarite", () => {
    it("classe un numéro de voie différent", () => {
      expect(
        classifySiteSimilarite(
          {
            adresse: { label: "134 rue Gilles de Montal, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte des Pins",
          },
          {
            adresse: { label: "135 rue Gilles de Montal, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte voisin",
          },
        ),
      ).toBe("numeroVoie");
    });

    it("classe un type de voie différent pour la même adresse", () => {
      expect(
        classifySiteSimilarite(
          {
            adresse: { label: "12 avenue des Prés, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte des Pins",
          },
          {
            adresse: { label: "12 chemin des Prés, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte voisin",
          },
        ),
      ).toBe("typeVoie");
    });

    it("classe une adresse complète déjà existante", () => {
      expect(
        classifySiteSimilarite(
          {
            adresse: { label: "12 rue des Prés, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte des Pins",
          },
          {
            adresse: { label: "12 rue des Prés, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte des Pins",
          },
        ),
      ).toBe("adresseComplete");
    });

    it("classe un nom de lieu différent pour la même adresse", () => {
      expect(
        classifySiteSimilarite(
          {
            adresse: { label: "12 rue des Prés, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte des Pins",
          },
          {
            adresse: { label: "12 rue des Prés, 67730 La Vancelle" },
            nomSiteOfficiel: "Gîte Les Pins",
          },
        ),
      ).toBe("nomLieu");
    });

    it("classe une saisie sans numéro comme numeroVoie face à un numéro", () => {
      expect(
        classifySiteSimilarite(
          {
            adresse: { label: "Chemin du Lac 26190 Bouvante" },
            nomSiteOfficiel: "LA JACINE",
          },
          {
            adresse: { label: "152 Chemin du Lac 26190 Bouvante" },
            nomSiteOfficiel: "VILLAGE VACANCES LA JACINE",
          },
        ),
      ).toBe("numeroVoie");
    });
  });
});
