import type { HebergementDto } from "@vao/shared-bridge";

import Hebergement from "../../../services/hebergement/Hebergement";

export const createHebergement = async ({
  userId,
  organismeId,
  hebergement = {},
}: {
  userId?: number;
  organismeId?: number;
  hebergement?: Partial<HebergementDto>;
}): Promise<number> => {
  const fixture: Omit<HebergementDto, "id"> = {
    coordonnees: {
      adresse: {
        codeInsee: "75001",
        codePostal: "75001",
        coordinates: [10.0, 20.0],
        departement: "75",
        label: "Hébergement 1",
      },
      email: "hebergement@example.com",
      nomGestionnaire: "Gestionnaire 1",
      numTelephone1: "0102030405",
      numTelephone2: "0607080900",
    },
    informationsLocaux: {
      accessibilite: "accessible",
      accessibilitePrecision: "Description de l'accessibilité",
      amenagementsSpecifiques: false,
      chambresDoubles: true,
      chambresUnisexes: true,
      couchageIndividuel: true,
      descriptionLieuHebergement: "Description du lieu d'hébergement",
      fileDernierArreteAutorisationMaire: null,
      fileDerniereAttestationSecurite: null,
      fileReponseExploitantOuProprietaire: null,
      litsDessus: false,
      nombreLits: 10,
      nombreLitsSuperposes: 10,
      nombreMaxPersonnesCouchage: 10,
      pension: "pension_complexe",
      precisionAmenagementsSpecifiques:
        "Description des amenagements spécifiques",
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
    nom: "Hébergement 1",
    organismeId: organismeId ?? 1,
    statut: "actif",
    ...hebergement,
  };

  return await Hebergement.create(
    userId ?? 1,
    organismeId ?? 1,
    "actif",
    fixture,
  );
};
