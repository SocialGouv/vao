import { getPool } from "../../utils/pgpool";

type CreateDemandeSejourParams = {
  organismeId: number;
  idFonctionnelle?: string;
  libelle?: string;
  statut?: string;
  departementSuivi?: string;
};

export const createDemandeSejour = async ({
  organismeId,
  idFonctionnelle = "TSTMSG001",
  libelle = "Declaration message test",
  statut = "BROUILLON",
  departementSuivi = "75",
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

  return declarationResponse.rows[0]?.id ?? 1;
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
