import { OrganismesRepositoryShared } from "./organismes.repository";

export const OrganismesServiceShared = {
  getListMailByOrganismesId: async ({
    id,
  }: {
    id: number;
  }): Promise<{ mail: string }[]> => {
    return await OrganismesRepositoryShared.getListMailByOrganismesId({ id });
  },
};
