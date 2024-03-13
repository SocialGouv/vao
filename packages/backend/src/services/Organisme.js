/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.organismes (type_organisme, personne_morale, personne_physique) 
    VALUES ($1, $2, $3)
    RETURNING
      id as "organismeId"
    ;
`,
  get: (criterias) => [
    `
    SELECT
      o.id as "organismeId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_organisme as "typeOrganisme",
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
        WHERE organisme_id = o.id
        AND a.supprime = false
      ) AS agrement
    FROM front.organismes o
    JOIN front.user_organisme uo ON o.id = org_id
    WHERE 1=1 
    ${Object.keys(criterias)
      .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
      .join(" ")}
    `,
    Object.values(criterias),
  ],
  getBySiret: `
    SELECT
      o.id as "organismeId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_organisme as "typeOrganisme",
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
        WHERE organisme_id = o.id
        AND a.supprime = false
      ) AS agrement
    FROM front.organismes o
    JOIN front.user_organisme uo ON o.id = org_id
    WHERE o.personne_morale->>'siret' = $1
`,
  getSiege: `
    SELECT
      o.id as "organismeId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_organisme as "typeOrganisme",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.protocole_transport as "protocoleTransport",
      o.protocole_sanitaire as "protocoleSanitaire",
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
          WHERE organisme_id = o.id
          AND a.supprime = false
          ) AS agrement,
      o.created_at as "createdAt",
      o.edited_at as "editedAt"
    FROM front.organismes o
    JOIN front.user_organisme uo ON o.id = org_id
    WHERE o.personne_morale->>'siren' = $1 
      AND o.personne_morale->>'siegeSocial' = 'true'
`,
  link: `
    INSERT INTO front.user_organisme (use_id, org_id)
      VALUES($1, $2)
    RETURNING use_id as "userLinked"
`,
  update: `
    UPDATE front.organismes 
    SET 
      type_organisme = $2,
      personne_morale = $3, 
      personne_physique = $4,
      complet = (CASE WHEN $5 = true THEN false ELSE complet END)
    WHERE id = $1
    RETURNING
      id as "updatedOrganismeId"
  `,
  updateFinalisation: `
    UPDATE front.organismes 
    SET complet = true
    WHERE id = $1
    RETURNING
      id as "updatedOrganismeId"
`,
  updateSanitaire: `
    UPDATE front.organismes 
    SET 
      protocole_sanitaire = $2,
      complet = (
        CASE WHEN $3 = true 
          THEN false 
          ELSE complet 
        END
      )
    WHERE id = $1
    RETURNING 
      id as "updatedOrganismeId"
`,
  updateTransport: `
    UPDATE front.organismes 
    SET 
      protocole_transport = $2,
      complet = (
        CASE WHEN $3 = true 
          THEN false 
          ELSE complet 
        END
      )
    WHERE id = $1
    RETURNING
      id as "updatedOrganismeId"
`,
};

module.exports.create = async (type, parametre) => {
  log.i("create - IN", { type });
  const response =
    type === "personne_morale"
      ? await pool.query(query.create, [type, parametre, {}])
      : await pool.query(query.create, [type, {}, parametre]);
  const { organismeId } = response && response.rows[0];
  log.d("create - DONE", { organismeId });
  return organismeId;
};

module.exports.link = async (userId, organismeId) => {
  log.i("link - IN");
  const response = await pool.query(query.link, [userId, organismeId]);
  const { userLinked } = response && response.rows[0];
  log.d("link - DONE", { userLinked });
  return userLinked;
};

module.exports.update = async (type, parametre, organismeId) => {
  log.i("update - IN", { type });
  const isComplete = parametre.meta === true;
  let response;
  switch (type) {
    case "personne_morale": {
      response = await pool.query(query.update, [
        organismeId,
        type,
        parametre,
        {},
        isComplete,
      ]);
      break;
    }
    case "personne_physique": {
      response = await pool.query(query.update, [
        organismeId,
        type,
        {},
        parametre,
        isComplete,
      ]);
      break;
    }
    case "protocole_transport": {
      response = await pool.query(query.updateTransport, [
        organismeId,
        parametre,
        isComplete,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      response = await pool.query(query.updateSanitaire, [
        organismeId,
        parametre,
        isComplete,
      ]);
      break;
    }
    case "synthese": {
      response = await pool.query(query.updateFinalisation, [organismeId]);
      break;
    }
    default:
      log.d("wrong type");
      return null;
  }
  const { updatedOrganismeId } = response && response.rows[0];
  log.d("update - DONE", { updatedOrganismeId });
  return organismeId;
};

module.exports.get = async (criterias = {}) => {
  log.i("get - IN", { criterias });
  const { rows: organismes } = await pool.query(...query.get(criterias));
  log.d("get - DONE");
  return !organismes || organismes.length === 0 ? [] : organismes[0];
};

module.exports.getBySiret = async (siret) => {
  log.i(`getBySiret - IN ${siret}`);
  const { rows: organismes } = await pool.query(query.getBySiret, [siret]);
  log.d("getBySiret - DONE");
  return !organismes || organismes.length === 0 ? null : organismes[0];
};

module.exports.getSiege = async (siret) => {
  log.i("getSiege - IN", siret);
  const siren = siret.substr(0, 9);
  log.w("SIREN", siren);
  const { rows: organismes } = await pool.query(query.getSiege, [siren]);
  log.d("getSiege - DONE");
  log.d(organismes);
  return !organismes || organismes.length === 0 ? null : organismes[0];
};
