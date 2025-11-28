export const EtablissementsSecondairesRepository = {
  associateEtablissement: async ({
    client,
    etablissements,
    personneMoraleId,
  }: {
    client: any;
    etablissements: {
      nic?: string;
      siret?: string;
      adresse?: string;
      commune?: string;
      enabled?: boolean;
      codePostal?: string;
      denomination?: string;
      etatAdministratif?: string;
    }[];
    personneMoraleId: Number;
  }) => {
    const query = (valueParams: string) => `
    INSERT INTO front.opm_etablissements (
        personne_morale_id,
        nic,
        siret,
        adresse,
        commune,
        enabled,
        code_postal,
        denomination,
        etat_administratif
      )
      VALUES ${valueParams}
  `;
    if (etablissements && Object.keys(etablissements).length !== 0) {
      const valuesEtablissement = etablissements.flatMap((etablissement) => [
        personneMoraleId,
        etablissement?.nic ?? null,
        etablissement?.siret ?? null,
        etablissement?.adresse ?? null,
        etablissement?.commune ?? null,
        etablissement?.enabled ?? null,
        etablissement?.codePostal ?? null,
        etablissement?.denomination ?? null,
        etablissement?.etatAdministratif ?? null,
      ]);

      const valuesParamsEtab = etablissements
        .map(
          (_, index) =>
            `($${index * 9 + 1}, $${index * 9 + 2}, $${index * 9 + 3}, $${index * 9 + 4}, $${index * 9 + 5}, $${index * 9 + 6}, $${index * 9 + 7}, $${index * 9 + 8}, $${index * 9 + 9})`,
        )
        .join(", ");
      await client.query(query(valuesParamsEtab), valuesEtablissement);
    }
  },
  removeEtablissements: async ({
    client,
    personneMoraleId,
  }: {
    client: any;
    personneMoraleId: Number;
  }) => {
    const query = `
        DELETE FROM front.opm_etablissements
        WHERE
        personne_morale_id = $1;
    `;
    await client.query(query, [personneMoraleId]);
  },
};
