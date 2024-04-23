/* eslint-disable no-param-reassign */
const yup = require("yup");
const Regions = require("./geo/Region");

const AppError = require("../utils/error");
const ValidationAppError = require("../utils/validation-error");
const logger = require("../utils/logger");

const pool = require("../utils/pgpool").getPool();

const Organisme = require("../schemas/organisme");

const log = logger(module.filename);

let regions, organismeSchema;

const query = {
  create: `
    INSERT INTO front.organismes (type_organisme, personne_morale, personne_physique) 
    VALUES ($1, $2, $3)
    RETURNING
      id as "organismeId"
    ;
`,
  finalize: ({
    organismeId,
    typeOrganisme,
    personneMorale,
    personnePhysique,
    protocoleSanitaire,
    protocoleTransport,
  }) => [
    `
  UPDATE front.organismes 
  SET       
    type_organisme = $2,
    personne_morale = $3, 
    personne_physique = $4,
    protocole_sanitaire = $5,
    protocole_transport = $6,
    complet = true,
    edited_at = NOW()
  WHERE 
    id = $1
`,
    [
      organismeId,
      typeOrganisme,
      personneMorale,
      personnePhysique,
      protocoleSanitaire,
      protocoleTransport,
    ],
  ],
  get: (criterias) => [
    `
    SELECT
      o.id as "organismeId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_organisme as "typeOrganisme",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      (o.personne_morale ->> 'porteurAgrement')::boolean as "porteurAgrement",
      o.protocole_transport as "protocoleTransport",
      o.protocole_sanitaire as "protocoleSanitaire",
      o.created_at as "createdAt",
      o.edited_at as "editedAt",
      CASE 
        WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::boolean is False 
        THEN (
          SELECT 
            json_build_object(
              'numero', numero,
              'regionObtention', region_obtention,
              'dateObtention', date_obtention,
              'file', file,
              'createdAt', a.created_at
            )
          FROM front.agrements a
          JOIN front.organismes o2 ON o2.id = a.organisme_id 
          WHERE (o2.personne_morale ->> 'siret') = (o.personne_morale #>> '{etablissementPrincipal, siret}')
          AND a.supprime = false
        )
        ELSE (
          SELECT 
            json_build_object(
              'numero', numero,
              'regionObtention', region_obtention,
              'dateObtention', date_obtention,
              'file', file,
              'createdAt', a.created_at
            )
          FROM front.agrements a
          WHERE organisme_id = o.id
          AND a.supprime = false
        ) 
      END AS agrement
    FROM front.organismes o
    JOIN front.user_organisme uo ON uo.org_id = o.id
    WHERE 1=1 
    ${Object.keys(criterias)
      .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
      .join(" ")}
    `,
    Object.values(criterias),
  ],
  getBySiren: `
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
            'regionObtention', region_obtention,
            'dateObtention', date_obtention,
            'file', file,
            'createdAt', a.created_at
          )                  
        FROM front.agrements a            
        WHERE organisme_id = o.id
        AND a.supprime = false
      ) AS agrement
    FROM front.organismes o
    WHERE o.personne_morale->>'siren' = $1
`,
  link: `
    INSERT INTO front.user_organisme (use_id, org_id)
      VALUES($1, $2)
    RETURNING use_id as "userLinked"
`,
  updatePersonne: `
    UPDATE front.organismes 
    SET 
      type_organisme = $2,
      personne_morale = $3, 
      personne_physique = $4,
      complet = false,
      edited_at = NOW()
    WHERE id = $1
  `,
  updateSanitaire: `
    UPDATE front.organismes 
    SET 
      protocole_sanitaire = $2,
      complet = false,
      edited_at = NOW()
    WHERE id = $1
`,
  updateTransport: `
    UPDATE front.organismes 
    SET 
      protocole_transport = $2,
      complet = false,
      edited_at = NOW()
    WHERE id = $1
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
  const { rowCount } = await pool.query(query.link, [userId, organismeId]);

  if (rowCount === 0) {
    throw new AppError(
      "une erreur est survenue durant la création de liaison entre utilisateur et organisme",
      {
        name: "NOT_FOUND",
        statusCode: 404,
      },
    );
  }
};

module.exports.update = async (type, parametre, organismeId) => {
  log.i("update - IN", { type });
  let response;
  switch (type) {
    case "personne_morale": {
      log.i(parametre);
      response = await pool.query(query.updatePersonne, [
        organismeId,
        type,
        parametre,
        {},
      ]);
      break;
    }
    case "personne_physique": {
      response = await pool.query(query.updatePersonne, [
        organismeId,
        type,
        {},
        parametre,
      ]);
      break;
    }
    case "protocole_transport": {
      response = await pool.query(query.updateTransport, [
        organismeId,
        parametre,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      response = await pool.query(query.updateSanitaire, [
        organismeId,
        parametre,
      ]);
      break;
    }
    default:
      log.d("wrong type");
      return null;
  }
  const { rowCount } = response;
  if (rowCount === 0) {
    throw new AppError("Organisme non trouvé", {
      name: "NOT_FOUND",
      statusCode: 404,
    });
  }
  log.i("update - DONE");
};

module.exports.finalize = async function (userId) {
  log.i("finalize - IN", { userId });
  if (!regions) {
    regions = await Regions.fetch();
  }
  if (!organismeSchema) {
    organismeSchema = Organisme.schema(regions);
  }
  const criterias = {
    "uo.use_id": userId,
  };
  log.d(...query.get(criterias));
  const { rows, rowCount } = await pool.query(...query.get(criterias));
  if (rowCount !== 1) {
    throw new AppError("Organisme non trouvé", {
      name: "NOT_FOUND",
      statusCode: 404,
    });
  }
  let organisme = rows[0];
  try {
    organisme = await yup.object(organismeSchema).validate(organisme, {
      abortEarly: false,
      stripUnknown: true,
    });
    log.i("finalize", { organisme });
  } catch (error) {
    log.w(error);
    throw new ValidationAppError(error);
  }
  await pool.query(...query.finalize(organisme));
  log.i("finalize - DONE");
};

module.exports.get = async (criterias = {}) => {
  log.i("get - IN", { criterias });
  const { rows: organismes } = await pool.query(...query.get(criterias));
  log.i("get - DONE", organismes[0]);
  return !organismes || organismes.length === 0 ? [] : organismes[0];
};

module.exports.getBySiren = async (siren) => {
  log.i(`getBySiren - IN ${siren}`);
  const { rows: organismes } = await pool.query(query.getBySiren, [siren]);
  log.i("getBySiren - DONE");
  return organismes;
};
