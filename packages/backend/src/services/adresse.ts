import { AdresseDto } from "@vao/shared-bridge";

import { getPool } from "../utils/pgpool";

const query = {
  editCleInsee: `
    UPDATE FRONT.ADRESSE
    SET CLE_INSEE = $2
    WHERE ID = $1
    RETURNING id
  `,
  getByCleInseeOrLabel: `
    SELECT
      ID,
      CLE_INSEE as "cleInsee"
    FROM FRONT.ADRESSE
    WHERE CLE_INSEE = $1 OR LABEL = $2
  `,
  getById: `
    SELECT
      ID as "id",
      LABEL as "label",
      CODE_INSEE as "codeInsee",
      CODE_POSTAL as "codePostal",
      LONG as "long",
      LAT as "lat",
      DEPARTEMENT as "departement"
    FROM FRONT.ADRESSE
    WHERE id = $1
  `,
  getByIds: `
    SELECT
      id as "id",
      LABEL as "label",
      CODE_INSEE as "codeInsee",
      CODE_POSTAL as "codePostal",
      LONG as "long",
      LAT as "lat",
      DEPARTEMENT as "departement"
    FROM FRONT.ADRESSE
    WHERE id = ANY ($1)
  `,
  insert: `
    INSERT INTO FRONT.ADRESSE (
      CLE_INSEE, LABEL, CODE_INSEE, CODE_POSTAL,
      LONG, LAT, DEPARTEMENT
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id
  `,
};

interface DBAdresseSearchResult {
  id: number;
  cleInsee: string | null;
}

const getByCleInseeOrLabel = async (
  client: any,
  params: { cleInsee: string | null; label: string | null },
): Promise<DBAdresseSearchResult | null> => {
  const { rows } = await client.query(query.getByCleInseeOrLabel, [
    params.cleInsee,
    params.label,
  ]);
  return rows?.[0] ?? null;
};

export const saveAdresse = async (
  client: any,
  adresse: AdresseDto,
): Promise<number> => {
  const existing = await getByCleInseeOrLabel(client, {
    cleInsee: adresse.cleInsee,
    label: adresse.label,
  });

  if (existing && !existing.cleInsee && adresse.cleInsee) {
    const { rows } = await client.query(query.editCleInsee, [
      existing.id,
      adresse.cleInsee,
    ]);
    return rows[0].id;
  }

  if (!existing) {
    const { rows } = await client.query(query.insert, [
      adresse.cleInsee,
      adresse.label,
      adresse.codeInsee,
      adresse.codePostal,
      adresse.coordinates?.[0] ?? null,
      adresse.coordinates?.[1] ?? null,
      adresse.departement,
    ]);
    return rows[0].id;
  }

  return existing.id;
};

export const getById = async (id?: number | null) => {
  const { rows } = await getPool().query(query.getById, [id]);
  return rows?.[0] ?? null;
};

export const getByIds = async (ids?: (number | null)[]) => {
  const { rows } = await getPool().query(query.getByIds, [ids]);
  return rows ?? [];
};
