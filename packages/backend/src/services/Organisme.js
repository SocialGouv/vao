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
      o.protocole_transport as "protocoleTransport",
      o.protocole_sanitaire as "protocoleSanitaire",
      CASE
        WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::boolean is False
        THEN
        (
            SELECT
              json_build_object(
                'numero', numero,
                'regionObtention', region_obtention,
                'dateObtention', date_obtention,
                'file', file,
                'createdAt', a.created_at
              ) as "agrement"
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
              ) as "agrement"
          FROM front.agrements a
          WHERE organisme_id = o.id
          AND a.supprime = false
        )
      END AS agrement,
      o.created_at as "createdAt",
      o.edited_at as "editedAt"
    FROM front.organismes o
    JOIN front.user_organisme uo ON o.id = uo.org_id
    WHERE 1 = 1
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
      CASE
        WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::boolean is False
        THEN
        (
            SELECT
              json_build_object(
                'numero', numero,
                'regionObtention', region_obtention,
                'dateObtention', date_obtention,
                'file', file,
                'createdAt', a.created_at
              ) as "agrement"
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
              ) as "agrement"
          FROM front.agrements a
          WHERE organisme_id = o.id
          AND a.supprime = false
        )
      END AS agrement,
      o.created_at as "createdAt",
      o.edited_at as "editedAt"
    FROM front.organismes o
    WHERE o.personne_morale->>'siren' = $1
`,
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
      CASE
        WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::boolean is False
        THEN
        (
            SELECT
              json_build_object(
                'numero', numero,
                'regionObtention', region_obtention,
                'dateObtention', date_obtention,
                'file', file,
                'createdAt', a.created_at
              ) as "agrement"
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
              ) as "agrement"
          FROM front.agrements a
          WHERE organisme_id = o.id
          AND a.supprime = false
        )
      END AS agrement,
      o.created_at as "createdAt",
      o.edited_at as "editedAt"
    FROM front.organismes o
    JOIN front.user_organisme uo ON o.id = org_id
    WHERE o.personne_morale->>'siret' = $1
`,
  getListe: `
    SELECT
      o.id AS "organismeId",
      o.type_organisme AS "typeOrganisme",
      o.complet as "complet",
      o.personne_morale->>'siren' AS "siren",
      o.personne_morale->>'siret' AS "siret",
      o.personne_morale->>'raisonSociale' AS "raisonSociale",
      o.personne_physique->>'nomNaissance' AS "nomPersonnePhysique",
      COUNT (CASE WHEN o.id = ds.organisme_id AND ds.statut <> 'BROUILLON' THEN 1 ELSE NULL END)::integer AS "sejourCount",
      CASE
        WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::boolean is False
        THEN
        (
            SELECT
              json_build_object(
                'numero', numero,
                'regionObtention', region_obtention,
                'dateObtention', date_obtention,
                'file', file,
                'yearObtention', EXTRACT(YEAR FROM a.date_obtention)
              ) AS "agrement"
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
                'yearObtention', EXTRACT(YEAR FROM a.date_obtention)
              ) AS "agrement"
          FROM front.agrements a
          WHERE organisme_id = o.id
          AND a.supprime = false
        )
      END AS agrement,
      o.edited_at AS "editedAt"
    FROM front.organismes o
    LEFT JOIN front.demande_sejour ds ON ds.organisme_id = o.id
    WHERE o.supprime = false
    GROUP BY o.id;
`,
  getNonAgrees: `
SELECT
  ona.id AS "organismeId",
  ona.siret AS "siret",
  ona.nom AS "nom",
  ona.region_delivrance AS "regionDelivrance",
  ona.nature_decision AS "natureDecision",
  ona.date_decision AS "dateDecision",
  ona.created_at AS "createdAt",
  ona.edited_at AS "editedAt"
FROM back.organisme_non_agree ona
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
      CASE
        WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::boolean is False
        THEN
        (
            SELECT
              json_build_object(
                'numero', numero,
                'regionObtention', region_obtention,
                'dateObtention', date_obtention,
                'file', file,
                'createdAt', a.created_at
              ) as "agrement"
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
              ) as "agrement"
          FROM front.agrements a
          WHERE organisme_id = o.id
          AND a.supprime = false
        )
      END AS agrement,
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
  updatePersonne: `
    UPDATE front.organismes
    SET
      type_organisme = $2,
      personne_morale = $3,
      personne_physique = $4,
      complet = complet AND $5,
      edited_at = NOW()
    WHERE id = $1
  `,
  updateSanitaire: `
    UPDATE front.organismes
    SET
      protocole_sanitaire = $2,
      complet = complet AND $3,
      edited_at = NOW()
    WHERE id = $1
`,
  updateTransport: `
    UPDATE front.organismes
    SET
      protocole_transport = $2,
      complet = complet AND $3,
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

  if (!regions) {
    regions = await Regions.fetch();
  }
  switch (type) {
    case "personne_morale": {
      const complet =
        await Organisme.schema(regions).personneMorale.isValid(parametre);
      response = await pool.query(query.updatePersonne, [
        organismeId,
        type,
        parametre,
        {},
        complet,
      ]);
      break;
    }
    case "personne_physique": {
      const complet =
        await Organisme.schema(regions).personnePhysique.isValid(parametre);
      response = await pool.query(query.updatePersonne, [
        organismeId,
        type,
        {},
        parametre,
        complet,
      ]);
      break;
    }
    case "protocole_transport": {
      const complet =
        await Organisme.schema(regions).protocoleTransport.isValid(parametre);
      response = await pool.query(query.updateTransport, [
        organismeId,
        parametre,
        complet,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      const complet =
        await Organisme.schema(regions).protocoleSanitaire.isValid(parametre);
      response = await pool.query(query.updateSanitaire, [
        organismeId,
        parametre,
        complet,
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
    log.d("finalize", { organisme });
  } catch (error) {
    log.w(error);
    throw new ValidationAppError(error);
  }
  await pool.query(...query.finalize(organisme));
  log.i("finalize - DONE");
};

module.exports.getOne = async (criterias = {}) => {
  log.i("getOne - IN", { criterias });
  const { rowCount, rows: organismes } = await pool.query(
    ...query.get(criterias),
  );
  if (rowCount === 0) {
    throw new AppError("Organisme non trouvé", {
      name: "NOT_FOUND",
      statusCode: 404,
    });
  }
  log.i("getOne - DONE");
  return organismes[0];
};

module.exports.getBySiren = async (siren) => {
  log.i("getBySiren - IN", { siren });
  const { rows: organismes } = await pool.query(query.getBySiren, [siren]);
  log.i("getBySiren - DONE");
  return organismes;
};
module.exports.getBySiret = async (siret) => {
  log.i(`getBySiret - IN ${siret}`);
  const { rows: organismes } = await pool.query(query.getBySiret, [siret]);
  log.i("getBySiret - DONE");
  return !organismes || organismes.length === 0 ? null : organismes[0];
};

module.exports.getSiege = async (siret) => {
  log.i("getSiege - IN", { siret });
  const siren = siret.substr(0, 9);
  log.d("getSiege", { siren });
  const { rowCount, rows: organismes } = await pool.query(query.getSiege, [
    siren,
  ]);
  log.d("getSiege", { organismes });
  log.i("getSiege - DONE");
  return rowCount === 0 ? null : organismes[0];
};

module.exports.get = async () => {
  log.i("get - IN");
  const { rows: organismes } = await pool.query(query.getListe, []);
  log.i("get - DONE");
  return organismes ?? [];
};

module.exports.getNonAgrees = async () => {
  log.i("getNonAgrees - IN");
  const { rows: organismes } = await pool.query(query.getNonAgrees, []);
  log.i("getNonAgrees - DONE");
  return organismes ?? [];
};
