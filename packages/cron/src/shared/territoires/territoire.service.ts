import { FicheTerritoire } from "./territoire.type";
import { TerritoireRepositoryShared } from "./territoire.repository";

export const TerritoireServiceShared = {
  getByTerCode: async ({
    terCode,
  }: {
    terCode: string;
  }): Promise<FicheTerritoire> => {
    const ficheTerritoire =
      await TerritoireRepositoryShared.getByTerCode(terCode);
    return ficheTerritoire;
  },
};
