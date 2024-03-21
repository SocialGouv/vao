/* eslint-disable no-param-reassign */
const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.hebergement(
      user_id, 
      nom,  
      coordonnees,
      informations_locaux,
      informations_transport,
      created_at,
      edited_at
    )
    VALUES (
      $1, 
      $2, 
      $3, 
      $4, 
      $5, 
      NOW(),
      NOW()
    )
    RETURNING id
    `,
  get: `
    SELECT
      id,
      nom,
      coordonnees#> '{adresse, departement}' as departement,
      coordonnees#> '{adresse, label}' as adresse,
      supprime,
      created_at as "createdAt",
      edited_at as "editedAt"
    FROM front.hebergement 
    WHERE 
      user_id = $1
    `,
  getOne: (criterias) => [
    `
    SELECT
      id,
      supprime,
      nom,
      coordonnees,
      informations_locaux as "informationsLocaux",
      informations_transport as "informationsTransport",
      created_at as "createdAt",
      edited_at as "editedAt"
    FROM front.hebergement          
    WHERE 1 = 1 
    ${Object.keys(criterias)
      .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
      .join(" ")}
    `,
    Object.values(criterias),
  ],
  update: `
    UPDATE front.hebergement
    SET 
      nom = $2, 
      coordonnees = $3,
      informations_locaux = $4,
      informations_transport = $5, 
      edited_at = NOW()
    WHERE id = $1
  `,
};

module.exports.create = async (
  userId,
  nom,
  coordonnees,
  informationsLocaux,
  informationsTransport,
) => {
  log.i("create - IN");
  const response = await pool.query(query.create, [
    userId,
    nom,
    coordonnees,
    informationsLocaux,
    informationsTransport,
  ]);
  if (response) {
    log.i(response);
    const { id } = response.rows[0];
    log.d("create - DONE", { id });
    return id;
  }
  return false;
};

module.exports.update = async (
  id,
  nom,
  coordonnees,
  informationsLocaux,
  informationsTransport,
) => {
  log.i("create - IN");
  const { rowCount } = await pool.query(query.update, [
    id,
    nom,
    coordonnees,
    informationsLocaux,
    informationsTransport,
  ]);
  if (rowCount === 0) {
    throw new AppError("hebergement " + id + " not found");
  }
};

module.exports.get = async (userId) => {
  log.i("get - IN", { userId });
  const response = await pool.query(query.get, [userId]);
  log.d("get - DONE");
  const hebergements = response.rows;
  return hebergements;
};

module.exports.getOne = async (criterias = {}) => {
  log.i("getOne - IN", { criterias });
  const { rows: hebergements, rowCount } = await pool.query(
    ...query.getOne(criterias),
  );
  log.d("getOne - DONE");
  return rowCount > 0 ? hebergements[0] : null;
};
