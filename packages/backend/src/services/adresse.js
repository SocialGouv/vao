const { getPool } = require("../utils/pgpool");

const query = {
  editCleInsee: `
  UPDATE FRONT.ADRESSE
  SET
    CLE_INSEE = $2
  WHERE
    ID = $1
  RETURNING id
  `,
  getByCleInseeOrLabel: `
    SELECT
      ID, CLE_INSEE as "cleInsee"
    FROM
      FRONT.ADRESSE
    WHERE
      CLE_INSEE = $1
      OR LABEL = $2
  `,
  getById: `
 SELECT
  LABEL as "label",
  CODE_INSEE as "codeInsee",
  CODE_POSTAL as "codePostal",
  LONG as "long",
  LAT as "lat",
  DEPARTEMENT as "departement"
FROM
  FRONT.ADRESSE
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
FROM
  FRONT.ADRESSE
WHERE id = ANY ($1)
  `,
  insert: `
  INSERT INTO
    FRONT.ADRESSE (
      CLE_INSEE,
      LABEL,
      CODE_INSEE,
      CODE_POSTAL,
      LONG,
      LAT,
      DEPARTEMENT
    )
  VALUES
    ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id
    `,
};

const getByCleInseeOrLabel = async (client, { cleInsee, label }) => {
  const { rows } = await client.query(query.getByCleInseeOrLabel, [
    cleInsee,
    label,
  ]);
  return rows?.[0] ?? null;
};

module.exports.saveAdresse = async (client, adresse) => {
  const existingAdresse = await getByCleInseeOrLabel(client, {
    cleInsee: adresse.cleInsee,
    label: adresse.label,
  });

  if (existingAdresse && !existingAdresse.cleInsee && adresse.cleInsee) {
    const { rows } = await client.query(query.editCleInsee, [
      existingAdresse.id,
      adresse.cleInsee,
    ]);
    return rows[0].id;
  }
  console.log("adresse", adresse);
  console.log("adresse", adresse.coordinates);
  console.log("adresse", adresse.coordinates[0]);
  if (!existingAdresse) {
    const { rows } = await client.query(query.insert, [
      adresse.cleInsee,
      adresse.label,
      adresse.codeInsee,
      adresse.codePostal,
      adresse.coordinates[0],
      adresse.coordinates[1],
      adresse.departement,
    ]);

    return rows[0].id;
  }

  return existingAdresse.id;
};

module.exports.getById = async (id) => {
  const { rows } = await getPool().query(query.getById, [id]);
  return rows?.[0] ?? null;
};

module.exports.getByIds = async (ids) => {
  const { rows } = await getPool().query(query.getByIds, [ids]);
  return rows ?? [];
};
