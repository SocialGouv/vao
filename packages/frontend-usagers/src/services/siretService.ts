const SiretService = {
  getSiretSiegeSocial: async (siret: string) => {
    const url = `/siret/${siret}`;
    const { uniteLegale } = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    return `${siret.substring(0, 9)}${uniteLegale?.uniteLegale?.nicSiegeUniteLegale ?? ""}`;
  },
};

export { SiretService };
