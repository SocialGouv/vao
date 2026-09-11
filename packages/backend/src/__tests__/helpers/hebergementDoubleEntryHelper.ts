import { getPool } from "../../utils/pgpool";

export const getCurrentUniteIdByHebergementId = async (
  hebergementId: number,
): Promise<number | null> => {
  const { rows } = await getPool().query<{ id: number }>(
    `SELECT uh.id
     FROM front.unite_hebergement uh
     JOIN front.hebergement h ON h.id = uh.id AND h."current" IS TRUE
     WHERE uh.hebergement_id = (
         SELECT hebergement_id
         FROM front.hebergement
         WHERE id = $1
         LIMIT 1
       )
       AND uh."current" IS TRUE`,
    [hebergementId],
  );
  return rows[0]?.id ?? null;
};

export const getUniteStatutValue = async (
  uniteHebergementId: number,
): Promise<string | null> => {
  const { rows } = await getPool().query<{ value: string | null }>(
    `SELECT hs.value
     FROM front.unite_hebergement uh
     LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
     WHERE uh.id = $1
       AND uh."current" IS TRUE`,
    [uniteHebergementId],
  );
  return rows[0]?.value ?? null;
};
