import { randomInt } from "crypto";

import { readFicheIdByTerCode, update } from "../../../services/Territoire";

export const createTerritoire = async ({
  territoireCode,
  territoire = {},
}: {
  territoire?: Partial<object>;
  territoireCode?: string;
} = {}): Promise<number> => {
  const fixture = {
    email: `${randomInt(1000, 9999)}@territoire.com`,
    nom: randomInt(1000, 9999).toString(),
    prenom: randomInt(1000, 9999).toString(),
    telephone: `0${randomInt(100000000, 999999999)}`,
    ...territoire,
  };
  const { id: territoireId }: number =
    await readFicheIdByTerCode(territoireCode);

  if (territoireId) {
    await update(territoireId, fixture);
  }
  return territoireId;
};
