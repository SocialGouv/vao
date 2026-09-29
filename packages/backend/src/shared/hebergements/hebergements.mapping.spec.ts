import type { CoordonneesDto, InformationsLocauxDto } from "@vao/shared-bridge";

import {
  applySiteOrganismeToHebergement,
  applyUniteToHebergement,
  buildUniteWriteData,
  uniteToLegacyPayload,
} from "./hebergements.mapping";

describe("hebergements.mapping", () => {
  it("should preserve unknown accessibilite as null on write", () => {
    const result = buildUniteWriteData({
      informationsLocaux: {
        accessibilite: "inconnu",
      } as InformationsLocauxDto,
    });

    expect(result.accessibilitePmr).toBeNull();
  });

  it("should keep legacy accessibilite when unite accessibilitePmr is null", () => {
    const hebergement = {
      informationsLocaux: {
        accessibilite: "inconnu",
      },
    } as never;

    const unite = {
      accessibilitePmr: null,
    } as never;

    const result = applyUniteToHebergement(hebergement, unite);

    expect(result.informationsLocaux.accessibilite).toBe("inconnu");
  });

  describe("uniteToLegacyPayload", () => {
    it("should map a unite payload with a null visiteLocauxAt", () => {
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          accessibilitePmr: true,
          nombreCouchageTotal: 6,
          visiteLocauxAt: null,
        } as never,
      });

      expect(legacy.informationsLocaux.visiteLocauxAt).toBeNull();
      expect(legacy.informationsLocaux.accessibilite).toBe("accessible");
      expect(legacy.informationsLocaux.nombreLits).toBe(6);
      expect(legacy.informationsLocaux.nombreMaxPersonnesCouchage).toBe(6);
      expect(legacy.informationsLocaux.prestationsHotelieres).toEqual([]);
      expect(legacy.informationsTransport).toEqual({
        deplacementProximite: null,
        excursion: null,
        vehiculesAdaptes: null,
      });
    });

    it("should map a Date visiteLocauxAt as-is", () => {
      const visitedAt = new Date();
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          visiteLocauxAt: visitedAt,
        } as never,
      });

      expect(legacy.informationsLocaux.visiteLocauxAt).toBe(visitedAt);
    });

    it("should map a string visiteLocauxAt into a Date", () => {
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          visiteLocauxAt: "2026-03-16T10:00:00Z" as unknown as Date,
        } as never,
      });

      expect(legacy.informationsLocaux.visiteLocauxAt).toEqual(
        new Date("2026-03-16T10:00:00Z"),
      );
    });

    it("should map a false accessibilitePmr to non_adapte", () => {
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          accessibilitePmr: false,
        } as never,
      });

      expect(legacy.informationsLocaux.accessibilite).toBe("non_adapte");
    });

    it("should map litsSuperposes true to 1 and false to 0", () => {
      const legacyTrue = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          litsSuperposes: true,
        } as never,
      });
      const legacyFalse = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          litsSuperposes: false,
        } as never,
      });

      expect(legacyTrue.informationsLocaux.nombreLitsSuperposes).toBe(1);
      expect(legacyFalse.informationsLocaux.nombreLitsSuperposes).toBe(0);
    });

    it("should map null litsSuperposes to null", () => {
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          litsSuperposes: null,
        } as never,
      });

      expect(legacy.informationsLocaux.nombreLitsSuperposes).toBeNull();
    });

    it("should wrap file uuids into { uuid } objects", () => {
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {
          fileDernierArreteAutorisationMaire: "file-uuid",
          fileDerniereAttestationSecurite: "secu-uuid",
          fileReponseExploitantOuProprietaire: "exploitant-uuid",
        } as never,
      });

      expect(
        legacy.informationsLocaux.fileDernierArreteAutorisationMaire,
      ).toEqual({ uuid: "file-uuid" });
      expect(legacy.informationsLocaux.fileDerniereAttestationSecurite).toEqual(
        { uuid: "secu-uuid" },
      );
      expect(
        legacy.informationsLocaux.fileReponseExploitantOuProprietaire,
      ).toEqual({ uuid: "exploitant-uuid" });
    });

    it("should keep file null when unite has none", () => {
      const legacy = uniteToLegacyPayload({
        coordonnees: {} as CoordonneesDto,
        nom: "Hebergement",
        uniteData: {} as never,
      });

      expect(
        legacy.informationsLocaux.fileDernierArreteAutorisationMaire,
      ).toBeNull();
      expect(
        legacy.informationsLocaux.fileDerniereAttestationSecurite,
      ).toBeNull();
      expect(
        legacy.informationsLocaux.fileReponseExploitantOuProprietaire,
      ).toBeNull();
    });
  });

  describe("buildUniteWriteData files", () => {
    it("should extract a string file uuid", () => {
      const result = buildUniteWriteData({
        informationsLocaux: {
          fileReponseExploitantOuProprietaire: "file-uuid",
        } as InformationsLocauxDto,
      });

      expect(result.fileReponseExploitantOuProprietaire).toBe("file-uuid");
    });

    it("should extract a file uuid from a { uuid } object", () => {
      const result = buildUniteWriteData({
        informationsLocaux: {
          fileDernierArreteAutorisationMaire: {
            uuid: "file-uuid",
          },
        } as InformationsLocauxDto,
      });

      expect(result.fileDernierArreteAutorisationMaire).toBe("file-uuid");
    });

    it("should return null for a file object without uuid", () => {
      const result = buildUniteWriteData({
        informationsLocaux: {
          fileDerniereAttestationSecurite: { name: "doc.pdf" },
        } as InformationsLocauxDto,
      });

      expect(result.fileDerniereAttestationSecurite).toBeNull();
    });

    it("should map accessibilite non_adapte to false", () => {
      const result = buildUniteWriteData({
        informationsLocaux: {
          accessibilite: "non_adapte",
        } as InformationsLocauxDto,
      });

      expect(result.accessibilitePmr).toBe(false);
    });
  });

  describe("applyUniteToHebergement", () => {
    it("should keep legacy lits count when unite has bunk beds and legacy > 0", () => {
      const result = applyUniteToHebergement(
        {
          informationsLocaux: {
            accessibilite: "accessible",
            nombreLitsSuperposes: 10,
          },
        } as never,
        { litsSuperposes: true } as never,
      );

      expect(result.informationsLocaux.nombreLitsSuperposes).toBe(10);
    });

    it("should map unite bunk beds to 1 when legacy has none", () => {
      const result = applyUniteToHebergement(
        {
          informationsLocaux: {
            accessibilite: "accessible",
            nombreLitsSuperposes: 0,
          },
        } as never,
        { litsSuperposes: true } as never,
      );

      expect(result.informationsLocaux.nombreLitsSuperposes).toBe(1);
    });

    it("should map united without bunk beds to 0", () => {
      const result = applyUniteToHebergement(
        {
          informationsLocaux: {
            accessibilite: "accessible",
            nombreLitsSuperposes: null,
          },
        } as never,
        { litsSuperposes: false } as never,
      );

      expect(result.informationsLocaux.nombreLitsSuperposes).toBe(0);
    });

    it("should keep legacy lits count when unite has no info", () => {
      const result = applyUniteToHebergement(
        {
          informationsLocaux: {
            accessibilite: "accessible",
            nombreLitsSuperposes: 5,
          },
        } as never,
        { litsSuperposes: null } as never,
      );

      expect(result.informationsLocaux.nombreLitsSuperposes).toBe(5);
    });

    it("should apply unite accessibilite with majority when present", () => {
      const result = applyUniteToHebergement(
        {
          informationsLocaux: {
            accessibilite: "accessible",
            nombreLitsSuperposes: null,
          },
        } as never,
        { accessibilitePmr: false, litsSuperposes: null } as never,
      );

      expect(result.informationsLocaux.accessibilite).toBe("non_adapte");
    });
  });

  describe("applySiteOrganismeToHebergement", () => {
    it("should override transport from the site_organisme", () => {
      const result = applySiteOrganismeToHebergement(
        {
          informationsTransport: {
            deplacementProximite: "legacy",
            excursion: "legacy",
            vehiculesAdaptes: false,
          },
        } as never,
        {
          deplacementProximiteDescription: "à 10 min",
          excursionDescription: "Ballade",
          vehiculesAdaptes: true,
        } as never,
      );

      expect(result.informationsTransport).toEqual({
        deplacementProximite: "à 10 min",
        excursion: "Ballade",
        vehiculesAdaptes: true,
      });
    });

    it("should keep legacy transport when site_organisme values are null", () => {
      const result = applySiteOrganismeToHebergement(
        {
          informationsTransport: {
            deplacementProximite: "legacy",
            excursion: "legacy",
            vehiculesAdaptes: true,
          },
        } as never,
        {
          deplacementProximiteDescription: null,
          excursionDescription: null,
          vehiculesAdaptes: null,
        } as never,
      );

      expect(result.informationsTransport).toEqual({
        deplacementProximite: "legacy",
        excursion: "legacy",
        vehiculesAdaptes: true,
      });
    });
  });
});
