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
      const { siretEtablissementSuccesseur } = await $fetchBackend(url, {
        method: "GET",
        credentials: "include",
      });
      return siretEtablissementSuccesseur;
    } catch (error: any) {
      if (error?.data?.name === ERRORS_SIRET.EtablissementNoSuccesseur) {
        return "";
      } else {
        throw error;
      }
    }
  },
};

export { SiretService };
