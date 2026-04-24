import { FicheTerritoire } from "./territoire.type";
import { TerritoireRepositoryShared } from "./territoire.repository";

export const TerritoireServiceShared = {
  getByTerCode: async ({
    terCode,
  }: {
    terCode: string;
  }): Promise<FicheTerritoire> => {
    return await TerritoireRepositoryShared.getByTerCode(terCode);
  },
};
