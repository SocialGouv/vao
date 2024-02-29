/* eslint-disable no-param-reassign */
const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.hebergement(user_id,nom,caracteristiques,created_at,edited_at)
    VALUES ($1,$2,$3,NOW(),NOW())
    RETURNING id
    `,
  get: `
    SELECT
      id,
      caracteristiques#> '{adresse, departement}' as departement,
      caracteristiques#> '{adresse, label}' as adresse,
      supprime,
      nom,
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
      caracteristiques,
      created_at as "createdAt",
      edited_at as "editedAt"
    FROM front.hebergement          
    WHERE 1=1 
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
      caracteristiques = $3, 
      edited_at = NOW()
    WHERE id = $1
  `,
};

module.exports.create = async (userId, nom, caracteristiques) => {
  log.i("create - IN");
  const response = await pool.query(query.create, [
    userId,
    nom,
    caracteristiques,
  ]);
  if (response) {
    log.i(response);
    const { id } = response.rows[0];
    log.d("create - DONE", { id });
    return id;
  }
  return false;
};

module.exports.update = async (id, nom, caracteristiques) => {
  log.i("create - IN");
  const { rowCount } = await pool.query(query.update, [
    id,
    nom,
    caracteristiques,
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
  const { rows: operateurs } = await pool.query(...query.getOne(criterias));
  log.d("getOne - DONE");
  return operateurs[0] ?? [];
};
