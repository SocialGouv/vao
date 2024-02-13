/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  get: `
    SELECT
      id as "hebergementId",
      supprime as "supprime",
      nom as "nomHebergement",
      caracteristiques as "caracteristiques",
      created_at as "createdAt",
      edited_at as "editedAt"
    FROM front.hebergement 
    WHERE 
      user_id = $1
    `,

  getOne: (criterias) => [
    `
    SELECT
      o.id as "operateurId",
      o.supprime as "supprime",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.created_at as "createdAt",
      o.edited_at as "editedAt",
      (SELECT jsonb_agg(json_build_object(
      'numero', numero,
      'uuid', uuid,
      'regionDelivrance', region_delivrance,
      'dateObtention', date_obtention,
      'createdAt',a.created_at
    ))                   
    FROM front.agrements a            
    WHERE operateur_id = o.id
  ) AS agrement
    FROM front.operateurs o
    WHERE 1=1 
    ${Object.keys(criterias)
      .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
      .join(" ")}
    `,
    Object.values(criterias),
  ],

  create: `
    INSERT INTO front.hebergement(user_id,nom,caracteristiques,created_at,edited_at)
    VALUES ($1,$2,$3,NOW(),NOW())
    RETURNING id as "hebergementId"
    `,
};

module.exports.create = async (userId, nomHebergement, caracteristiques) => {
  log.i("create - IN");
  const response = await pool.query(query.create, [
    userId,
    nomHebergement,
    caracteristiques,
  ]);
  if (response) {
    log.i(response);
    const { hebergementId } = response.rows[0];
    log.d("create - DONE", { hebergementId });
    return hebergementId;
  }
  return false;
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
