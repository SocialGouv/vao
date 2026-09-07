import { randomUUID } from "node:crypto";

import type { HebergementDto } from "@vao/shared-bridge";

type HebergementPayloadFixture = Pick<
  HebergementDto,
  "coordonnees" | "informationsLocaux" | "informationsTransport" | "nom"
>;

export const buildHebergementFixture = (
  overrides: Partial<HebergementPayloadFixture> = {},
): HebergementPayloadFixture => {
  return {
    coordonnees: {
      adresse: {
        codeInsee: "75001",
        codePostal: "75001",
        coordinates: [10.0, 20.0],
        departement: "75",
        label: "Hebergement fixture",
      },
      email: "hebergement@example.com",
      nomGestionnaire: "Gestionnaire fixture",
      numTelephone1: "0102030405",
      numTelephone2: "0607080900",
    },
    informationsLocaux: {
      accessibilite: "accessible",
      accessibilitePrecision: "Description accessibilite",
      amenagementsSpecifiques: false,
      chambresDoubles: true,
      chambresUnisexes: true,
      couchageIndividuel: true,
      descriptionLieuHebergement: "Description du lieu",
      fileDernierArreteAutorisationMaire: null,
      fileDerniereAttestationSecurite: null,
      fileReponseExploitantOuProprietaire: null,
      litsDessus: false,
      nombreLits: 10,
      nombreLitsSuperposes: 10,
      nombreMaxPersonnesCouchage: 10,
      pension: "pension_complexe",
      precisionAmenagementsSpecifiques: "Aucun",
      prestationsHotelieres: ["blanchisseries", "entretien_locaux"],
      rangementIndividuel: true,
      reglementationErp: true,
      type: "hotel",
      visiteLocaux: true,
      visiteLocauxAt: new Date(),
    },
    informationsTransport: {
      deplacementProximite: "Transport en commun",
      excursion: "Excursions disponibles",
      vehiculesAdaptes: true,
    },
    nom: "Hebergement fixture",
    ...overrides,
  };
};

export const buildHebergementFixtureToPost = (
  overrides: Partial<HebergementPayloadFixture> = {},
): HebergementPayloadFixture => {
  const base = buildHebergementFixture(overrides);
  return {
    ...base,
    // Schema strict : reglementationErp = false impose une réponse exploitant/propriétaire
    informationsLocaux: {
      ...base.informationsLocaux,
      fileReponseExploitantOuProprietaire: {
        uuid: randomUUID(),
      },
      reglementationErp: false,
    },
  };
};

export const buildUniteHebergementFixtureToPost = (
  overrides: Partial<{
    coordonnees: HebergementPayloadFixture["coordonnees"];
    nom: string;
    uniteData: Record<string, unknown>;
  }> = {},
): {
  coordonnees: HebergementPayloadFixture["coordonnees"];
  nom: string;
  uniteData: Record<string, unknown>;
} => {
  return {
    coordonnees: {
      adresse: {
        codeInsee: "75001",
        codePostal: "75001",
        coordinates: [10.0, 20.0],
        departement: "75",
        label: "Hebergement fixture",
      },
      email: "hebergement@example.com",
      nomGestionnaire: "Gestionnaire fixture",
      numTelephone1: "0102030405",
      numTelephone2: "0607080900",
    },
    nom: "Hebergement fixture",
    uniteData: {
      accessibilitePmr: false,
      accessibilitePrecision: "Description accessibilite",
      amenagementsSpecifiques: false,
      amenagementsSpecifiquesPrecision: null,
      chambresDoubles: true,
      couchageIndividuel: true,
      deplacementProximiteDescription: "Transport en commun",
      excursionDescription: "Excursions disponibles",
      fileDernierArreteAutorisationMaire: null,
      fileDerniereAttestationSecurite: null,
      fileReponseExploitantOuProprietaire: randomUUID(),
      litsSuperposes: true,
      nombreCouchageTotal: 25,
      rangementIndividuel: true,
      reglementationErp: false,
      separationHommeFemme: true,
      vehiculesAdaptes: false,
      visiteLocaux: true,
      visiteLocauxAt: new Date(),
    },
    ...overrides,
  };
};
