const SiretService = {
  getSiretSiegeSocial: async (siret: string) => {
    const url = `/siret/${siret}`;
    const { uniteLegale } = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    return `${siret.substring(0, 9)}${uniteLegale?.uniteLegale?.nicSiegeUniteLegale ?? ""}`;
  },
  getDescriptionError: async (codeError: string) => {
    switch (codeError) {
      case "ETABLISSEMENTS_ERROR":
        return "Une erreur est survenue lors de la récupération des établissements à partir de l'Insee";
      case "SIRET_ERROR":
        return "Une erreur est survenue lors de la récupération des informations à partir de l'Insee";
      case "REPRESENTANTS_LEGAUX_ERROR":
        return "Une erreur est survenue lors de la récupération des informations des représentant légaux à partir de l'Insee";
      default:
        return "Une erreur inconnue est survenue lors de la récupération des données à partir du SIRET";
    }
  },
};

export { SiretService };
