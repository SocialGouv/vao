import { getPool } from "../../utils/pgpool";

type CreateDemandeSejourParams = {
  departementSuivi?: string;
  idFonctionnelle?: string;
  libelle?: string;
  organisme?: object;
  organismeId: number;
  personnel?: object;
  statut?: string;
  vacanciers?: object;
};

export const createDemandeSejour = async ({
  departementSuivi = "75",
  idFonctionnelle = "TSTMSG001",
  libelle = "Declaration message test",
  organisme,
  organismeId,
  personnel,
  statut = "BROUILLON",
  vacanciers,
}: CreateDemandeSejourParams): Promise<number> => {
  const declarationResponse = await getPool().query(
    `INSERT INTO front.demande_sejour (
      statut,
      departement_suivi,
      organisme_id,
      id_fonctionnelle,
      libelle,
      date_debut,
      date_fin,
      duree,
      periode,
      responsable_sejour
    )
    VALUES (
      $4,
      $5,
      $1,
      $2,
      $3,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 day',
      1,
      'vacances',
      '{"nom":"Resp","prenom":"Test"}'::jsonb
    )
    RETURNING id`,
    [organismeId, idFonctionnelle, libelle, statut, departementSuivi],
  );

  const declarationId = declarationResponse.rows[0]?.id ?? 1;

  if (
    personnel !== undefined &&
    vacanciers !== undefined &&
    organisme !== undefined
  ) {
    await getPool().query(
      `UPDATE front.demande_sejour
       SET personnel = $1::jsonb,
           vacanciers = $2::jsonb,
           organisme = $3::jsonb
       WHERE id = $4`,
      [
        JSON.stringify(personnel),
        JSON.stringify(vacanciers),
        JSON.stringify(organisme),
        declarationId,
      ],
    );
  }

  return declarationId;
};

export const deleteDemandeSejour = async (
  demandeSejourId: number,
): Promise<void> => {
  await getPool().query(
    `DELETE FROM front.demande_sejour_to_hebergement
     WHERE demande_sejour_id = $1`,
    [demandeSejourId],
  );

  await getPool().query("DELETE FROM front.demande_sejour WHERE id = $1", [
    demandeSejourId,
  ]);
};
