/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  get: `
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
        'dateObtention', a.date_obtention,
        'createdAt',a.created_at
      ))
      FROM front.agrements a            
      WHERE operateur_id = o.id
      ) AS agrement         
    FROM front.operateurs o
    JOIN front.user_operateur uo ON uo.ope_id = o.id 
    JOIN front.users u ON u.id = uo.use_id
    WHERE 
      u.id = $1
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
    INSERT INTO front.hebergement(type_hebergement,nom,created_at,edited_at)
    VALUES ($1,$2,NOW(),NOW())
    RETURNING id as "hebergementId"
    `,
};

module.exports.create = async (typeHebergement, nomHebergement) => {
  log.i("create - IN");
  const response = await pool.query(query.create, [
    typeHebergement,
    nomHebergement,
  ]);
  log.i(response);
  const { hebergementId } = response.rows[0];
  log.d("create - DONE", { hebergementId });
  return hebergementId;
};

module.exports.link = async (userId, operateurId) => {
  log.i("link - IN", { userId, operateurId });
  const response = await pool.query(query.link, [userId, operateurId]);
  const { userId: insertedUserId, operateurId: insertedOperateurId } =
    response.rows[0];
  log.d("link - DONE", { insertedUserId, insertedOperateurId });
  return { insertedUserId, insertedOperateurId };
};

module.exports.checkLink = async (userId, siret) => {
  log.i("checkLink - IN", { userId, siret });
  const { rowCount } = await pool.query(query.checkLink, [userId, siret]);
  log.d("checkLink - DONE", { rowCount });
  return rowCount;
};

module.exports.get = async (userId) => {
  log.i("get - IN", { userId });
  const response = await pool.query(query.get, [userId]);
  log.d("get - DONE");
  const operateurs = response.rows;
  return operateurs;
};

module.exports.getOne = async (criterias = {}) => {
  log.i("getOne - IN", { criterias });
  const { rows: operateurs } = await pool.query(...query.getOne(criterias));
  log.d("getOne - DONE");
  return operateurs[0] ?? [];
};
