/* eslint-disable no-param-reassign */
const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.hebergement(
      organisme_id, 
      nom,  
      coordonnees,
      informations_locaux,
      informations_transport,
      created_at,
      edited_at
    )
    VALUES (
      (SELECT org_id FROM front.user_organisme WHERE use_id = $1), 
      $2, 
      $3, 
      $4, 
      $5, 
      NOW(),
      NOW()
    )
    RETURNING id
    `,
  getById: (id) => [
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
    WHERE id = $1 
    `,
    [id],
  ],
  getByUserId: `
    SELECT
      id,
      nom,
      coordonnees#> '{adresse, departement}' as departement,
      coordonnees#> '{adresse, label}' as adresse,
      supprime,
      created_at as "createdAt",
      edited_at as "editedAt"
    FROM front.hebergement h
    JOIN front.user_organisme uo ON uo.org_id = h.organisme_id
    WHERE uo.use_id = $1
    `,
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
  { nom, coordonnees, informationsLocaux, informationsTransport },
) => {
  log.i("create - IN");
  const {
    rows: [{ id }],
  } = await pool.query(query.create, [
    userId,
    nom,
    coordonnees,
    informationsLocaux,
    informationsTransport,
  ]);
  log.d("create - DONE", { id });
  return id;
};

module.exports.update = async (
  hebergementId,
  { nom, coordonnees, informationsLocaux, informationsTransport },
) => {
  log.i("update - IN");
  const { rowCount } = await pool.query(query.update, [
    hebergementId,
    nom,
    coordonnees,
    informationsLocaux,
    informationsTransport,
  ]);
  if (rowCount === 0) {
    throw new AppError("hebergement " + hebergementId + " not found");
  }
  log.i("update - DONE");
};

module.exports.getByUserId = async (userId) => {
  log.i("getByUserId - IN", { userId });
  const response = await pool.query(query.getByUserId, [userId]);
  log.d("getByUserId - DONE");
  const hebergements = response.rows;
  return hebergements;
};

module.exports.getById = async (id) => {
  log.i("getById - IN", { id });
  const { rows: hebergements, rowCount } = await pool.query(
    ...query.getById(id),
  );
  log.d("getById - DONE");
  return rowCount > 0 ? hebergements[0] : null;
};
