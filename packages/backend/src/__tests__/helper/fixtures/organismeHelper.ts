import { partOrganisme } from "../../../helpers/org-part";
import {
  create as createOrganismeService,
  link as linkOrganisme,
} from "../../../services/Organisme";
import { generateRandomSiret } from "../organismeHelper";

export const createOrganisme = async ({
  userId,
  organisme = {},
  typeOrganisme = partOrganisme.PERSONNE_PHYSIQUE,
}: {
  organisme?: Partial<object>;
  userId?: number;
  typeOrganisme?: string;
} = {}): Promise<number> => {
  const timestamp = Date.now();
  const fixtureByTypeOrganisme =
    typeOrganisme === partOrganisme.PERSONNE_PHYSIQUE
      ? {
          nomNaissance: `TestNaissance${timestamp}`,
          nomUsage: `TestNom${timestamp}`,
          prenom: `TestPrenom${timestamp}`,
        }
      : {
          raisonSociale: `TestRaisonSociale${timestamp}`,
        };
  const fixture = {
    adresseDomicile: {
      cleInsee: "12345",
      codeInsee: "12345",
      codePostal: "75001",
      departement: "75",
      label: "123 Rue Test",
      lat: 48.8566,
      long: 2.3522,
    },
    adresseIdentique: true,
    adresseSiege: {
      cleInsee: "12345",
      codeInsee: "12345",
      codePostal: "75001",
      departement: "75",
      label: "123 Rue Test",
      lat: 48.8566,
      long: 2.3522,
    },
    profession: "Testeur",
    siret: generateRandomSiret(),
    telephone: "0102030405",
    ...fixtureByTypeOrganisme,
    ...organisme,
  };
  const organismeId = await createOrganismeService(
    typeOrganisme,
    fixture,
    userId,
  );
  if (userId) {
    await linkOrganisme(userId, organismeId);
  }
  return organismeId;
};
