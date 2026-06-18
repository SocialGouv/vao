import { randomInt } from "crypto";

import { partOrganisme } from "../../helpers/org-part";
import {
  create as createOrganismeService,
  link as linkOrganisme,
} from "../../services/Organisme";
import { getPool } from "../../utils/pgpool";

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

const usedSirets = new Set<string>();

export const generateRandomSiret = (): string => {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    // 14 digits, first digit non-zero
    const siret = randomInt(10_000_000_000_000, 100_000_000_000_000).toString();
    if (!usedSirets.has(siret)) {
      usedSirets.add(siret);
      return siret;
    }
  }
  throw new Error("Unable to generate random SIRET");
};

export const getRandomSiretAndSiren = (): { siren: string; siret: string } => {
  const siret = generateRandomSiret();
  return { siren: siret.slice(0, 9), siret };
};

export const markOrganismeComplet = async (id: number): Promise<void> => {
  await getPool().query(
    "UPDATE front.organismes SET complet = TRUE WHERE id = $1",
    [id],
  );
};
