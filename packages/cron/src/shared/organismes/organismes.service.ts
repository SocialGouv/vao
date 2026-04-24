import { OrganismesRepositoryShared } from "./organismes.repository";

export const OrganismesServiceShared = {
  getListMailByOrganismesId: async ({
    id,
  }: {
    id: number;
  }): Promise<{ mail: string }[]> => {
    const mailsOva = await OrganismesRepositoryShared.getListMailByOrganismesId(
      { id },
    );
    return mailsOva;
  },
};
