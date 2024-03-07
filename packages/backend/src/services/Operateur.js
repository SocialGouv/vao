/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.operateurs(type_operateur,personne_morale,personne_physique) 
    VALUES ($1,$2,$3)
    RETURNING
        id as "operateurId"
    ;
    `,
  get: (criterias) => [
    `
    SELECT
      o.id as "operateurId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_operateur as "typeOperateur",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.protocole_transport as "protocoleTransport",
      o.protocole_sanitaire as "protocoleSanitaire",
      o.created_at as "createdAt",
      o.edited_at as "editedAt",
      (
        SELECT 
          json_build_object(
            'numero', numero,
            'filename', filename,
            'uuid', uuid,
            'regionDelivrance', region_delivrance,
            'dateObtention', date_obtention,
            'createdAt',a.created_at
          )                  
        FROM front.agrements a            
        WHERE operateur_id = o.id
        AND a.supprime = false
      ) AS agrement
    FROM front.operateurs o
    JOIN front.user_operateur uo ON o.id = ope_id
    WHERE 1=1 
    ${Object.keys(criterias)
      .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
      .join(" ")}
    `,
    Object.values(criterias),
  ],
  getBySiret: `
    SELECT
      o.id as "operateurId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_operateur as "typeOperateur",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.protocole_transport as "protocoleTransport",
      o.protocole_sanitaire as "protocoleSanitaire",
      o.created_at as "createdAt",
      o.edited_at as "editedAt",
      (SELECT jsonb_agg(json_build_object(
      'numero', numero,
      'filename', filename,
      'uuid', uuid,
      'regionDelivrance', region_delivrance,
      'dateObtention', date_obtention::text,
      'createdAt',a.created_at
    ) ORDER BY date_obtention)                   
    FROM front.agrements a            
    WHERE operateur_id = o.id
    AND a.supprime = false
  ) AS agrement
    FROM front.operateurs o
    JOIN front.user_operateur uo ON o.id = ope_id
    WHERE o.personne_morale->>'siret' = $1
    `,
  getSiege: `
    SELECT
      o.id as "operateurId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_operateur as "typeOperateur",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.protocole_transport as "protocoleTransport",
      o.protocole_sanitaire as "protocoleSanitaire",
      o.created_at as "createdAt",
      o.edited_at as "editedAt",
      (SELECT jsonb_agg(json_build_object(
      'numero', numero,
      'filename', filename,
      'uuid', uuid,
      'regionDelivrance', region_delivrance,
      'dateObtention', date_obtention::text,
      'createdAt',a.created_at
    ) ORDER BY date_obtention)                   
    FROM front.agrements a            
    WHERE operateur_id = o.id
    AND a.supprime = false
  ) AS agrement
    FROM front.operateurs o
    JOIN front.user_operateur uo ON o.id = ope_id
    WHERE o.personne_morale->>'siren' = $1 
    AND o.personne_morale->>'siegeSocial' = 'true'
    `,
  link: `INSERT INTO front.user_operateur(use_id,ope_id)
  VALUES($1,$2)
  RETURNING use_id as "userLinked"`,
  update: `
    UPDATE front.operateurs SET 
      type_operateur=$2,
      personne_morale = $3, 
      personne_physique = $4,
      complet = (CASE WHEN $5 = true THEN false ELSE complet END)
    WHERE id = $1
    RETURNING
      id as "updatedOperateurId"
  `,
  updateFinalisation: `
UPDATE front.operateurs SET complet = true
WHERE id = $1
RETURNING
  id as "updateOperateurId"
`,
  updateSanitaire: `
    UPDATE front.operateurs SET protocole_sanitaire =$2,
    complet = (CASE WHEN $3 = true THEN false ELSE complet END)
    WHERE id = $1
    RETURNING 
      id as "updatedOperateurId"
`,
  updateTransport: `
    UPDATE front.operateurs SET protocole_transport =$2,
    complet = (CASE WHEN $3 = true THEN false ELSE complet END)
    WHERE id = $1
    RETURNING
      id as "updatedOperateurId"
`,
};

module.exports.create = async (type, parametre) => {
  log.i("create - IN", { type });
  const response =
    type === "personne_morale"
      ? await pool.query(query.create, [type, parametre, {}])
      : await pool.query(query.create, [type, {}, parametre]);
  const { operateurId } = response && response.rows[0];
  log.d("create - DONE", { operateurId });
  return operateurId;
};

module.exports.link = async (userId, operateurId) => {
  log.i("link - IN");
  const response = await pool.query(query.link, [userId, operateurId]);
  const { userLinked } = response && response.rows[0];
  log.d("link - DONE", { userLinked });
  return userLinked;
};

module.exports.update = async (type, parametre, operateurId) => {
  log.i("update - IN", { type });
  const notComplete = parametre.meta === false;
  let response;
  switch (type) {
    case "personne_morale": {
      response = await pool.query(query.update, [
        operateurId,
        type,
        parametre,
        {},
        notComplete,
      ]);
      break;
    }
    case "personne_physique": {
      response = await pool.query(query.update, [
        operateurId,
        type,
        {},
        parametre,
        notComplete,
      ]);
      break;
    }
    case "protocole_transport": {
      response = await pool.query(query.updateTransport, [
        operateurId,
        parametre,
        notComplete,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      response = await pool.query(query.updateSanitaire, [
        operateurId,
        parametre,
        notComplete,
      ]);
      break;
    }
    case "synthese": {
      response = await pool.query(query.updateFinalisation, [operateurId]);
      break;
    }
    default:
      log.d("wrong type");
      return null;
  }
  const { updatedOperateurId } = response && response.rows[0];
  log.d("update - DONE", { updatedOperateurId });
  return operateurId;
};

module.exports.get = async (criterias = {}) => {
  log.i("get - IN", { criterias });
  const { rows: operateurs } = await pool.query(...query.get(criterias));
  log.d("get - DONE");
  return !operateurs || operateurs.length === 0 ? [] : operateurs[0];
};

module.exports.getBySiret = async (siret) => {
  log.i(`getBySiret - IN ${siret}`);
  const { rows: operateurs } = await pool.query(query.getBySiret, [siret]);
  log.d("getBySiret - DONE");
  return !operateurs || operateurs.length === 0 ? null : operateurs[0];
};

module.exports.getSiege = async (siret) => {
  log.i("getSiege - IN", siret);
  const siren = siret.substr(0, 9);
  log.w("SIREN", siren);
  const { rows: operateurs } = await pool.query(query.getSiege, [siren]);
  log.d("getSiege - DONE");
  log.d(operateurs);
  return !operateurs || operateurs.length === 0 ? null : operateurs[0];
};
