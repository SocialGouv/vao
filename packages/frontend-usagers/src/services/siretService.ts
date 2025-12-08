import { ERRORS_SIRET } from "@vao/shared-bridge";

const SiretService = {
  getSiretSiegeSocial: async (siret: string) => {
    const url = `/siret/${siret}`;
    const { uniteLegale } = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    return `${siret.substring(0, 9)}${uniteLegale?.uniteLegale?.nicSiegeUniteLegale ?? ""}`;
  },
  getSiretEtablissementSuccesseur: async (siret: string) => {
    const url = `/siret/get-lien-succession/${siret}`;
    try {
      const { data } = await $fetchBackend(url, {
        method: "GET",
        credentials: "include",
      });
      return data.liensSuccession[0].siretEtablissementSuccesseur;
    } catch (error) {
      if (error?.data?.name === ERRORS_SIRET.EtablissementNoSuccesseur) {
        return "";
      } else {
        throw error;
      }
    }
  },
};

export { SiretService };
