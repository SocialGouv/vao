import { partOrganisme } from "../../../helpers/org-part";
import {
  create as createOrganismeService,
  link as linkOrganisme,
} from "../../../services/Organisme";

export const createOrganisme = async ({
  userId,
  organisme = {},
}: {
  organisme?: Partial<object>;
  userId?: number;
} = {}): Promise<number> => {
  const timestamp = Date.now();
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
    nomNaissance: `TestNaissance${timestamp}`,
    nomUsage: `TestNom${timestamp}`,
    prenom: `TestPrenom${timestamp}`,
    profession: "Testeur",
    siret: `123456789012${timestamp.toString().slice(-2)}`,
    telephone: "0102030405",
    ...organisme,
  };
  const organismeId = await createOrganismeService(
    partOrganisme.PERSONNE_PHYSIQUE,
    fixture,
  );
  if (userId) {
    await linkOrganisme(userId, organismeId);
  }
  return organismeId;
};
