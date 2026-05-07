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
