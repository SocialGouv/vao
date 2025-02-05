/* eslint-disable no-param-reassign */
const yup = require("yup");
const Regions = require("./geo/Region");

const AppError = require("../utils/error");
const ValidationAppError = require("../utils/validation-error");
const logger = require("../utils/logger");
const { partOrganisme } = require("../helpers/org-part");

const {
  applyFilters,
  applyPagination,
  sanitizePaginationParams,
  sanitizeFiltersParams,
} = require("../helpers/queryParams");

const pool = require("../utils/pgpool").getPool();

const Organisme = require("../schemas/organisme");
const PersonnePhysique = require("./organisme/PersonnePhysique");
const PersonneMorale = require("./organisme/PersonneMorale");
const ProtocoleSanitaire = require("./organisme/ProtocoleSanitaire");
const ProtocoleTransport = require("./organisme/ProtocoleTransport");

const log = logger(module.filename);

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
                'dateFinValidite', date_fin_validite,
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
                'dateFinValidite', date_fin_validite,
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
  getIsComplet: `
    SELECT
        complet
    FROM
        FRONT.ORGANISMES
    WHERE id = $1
  `,
  getListe: () =>
    `
    WITH stat AS (
      SELECT organisme_id,
            COUNT(CASE WHEN statut <> 'BROUILLON' THEN 1 ELSE NULL END)::INTEGER AS "sejourCount"
      FROM front.demande_sejour
      GROUP BY organisme_id
    ),
    agrement_data AS (
      SELECT o.id AS "organismeId",
            CASE
              WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::BOOLEAN IS FALSE THEN (
                SELECT JSON_BUILD_OBJECT(
                          'numero', numero,
                          'regionObtention', region_obtention,
                          'dateObtention', date_obtention
                        )
                FROM front.agrements a
                JOIN front.organismes o2 ON o2.id = a.organisme_id
                WHERE (o2.personne_morale ->> 'siret') = (o.personne_morale #>> '{etablissementPrincipal, siret}')
                  AND a.supprime = FALSE
              )
              ELSE (
                SELECT JSON_BUILD_OBJECT(
                          'numero', numero,
                          'regionObtention', region_obtention,
                          'dateObtention', date_obtention
                        )
                FROM front.agrements a
                WHERE organisme_id = o.id AND a.supprime = FALSE
              )
            END AS "agrement"
      FROM front.organismes o
    )
    SELECT
      o.id as "organismeId",
      o.supprime as "supprime",
      o.complet as "complet",
      o.type_organisme as "typeOrganisme",
      COALESCE(stat."sejourCount", 0) AS "sejourCount",
      CASE
        WHEN o.type_organisme = 'personne_morale' THEN
          json_build_object(
            'raisonSociale', o.personne_morale->>'raisonSociale',
            'siret', o.personne_morale->>'siret'
          )
        WHEN o.type_organisme = 'personne_physique' THEN
          json_build_object(
            'nom', o.personne_physique->>'nomUsage',
            'prenom', o.personne_physique->>'prenom'
          )
        ELSE NULL
      END as "personne",
      ad."agrement",
      o.created_at as "createdAt",
      o.edited_at as "editedAt"
    FROM front.organismes o
    LEFT JOIN stat ON stat.organisme_id = o.id
    LEFT JOIN agrement_data ad ON ad."organismeId" = o.id
    WHERE o.supprime = FALSE
    `,
  getListeExtract: () => `
    WITH stat AS (
      SELECT organisme_id,
            COUNT(CASE WHEN statut <> 'BROUILLON' THEN 1 ELSE NULL END)::INTEGER AS "sejourCount",
            COUNT(CASE WHEN statut = 'TRANSMISE' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountTransmise",
            COUNT(CASE WHEN statut = 'ABANDONNEE' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountAbamdonnee",
            COUNT(CASE WHEN statut = 'ANNULEE' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountAnnulee",
            COUNT(CASE WHEN statut = 'EN ATTENTE DECLARATION 8 JOURS' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountAttente8j",
            COUNT(CASE WHEN statut = 'A MODIFIER' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountAModifier",
            COUNT(CASE WHEN statut = 'A MODIFIER 8J' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountAModifier8j",
            COUNT(CASE WHEN statut = 'EN COURS' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountEnCours",
            COUNT(CASE WHEN statut = 'EN COURS 8J' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountEnCours8j",
            COUNT(CASE WHEN statut = 'REFUSEE' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountRefusee",
            COUNT(CASE WHEN statut = 'REFUSEE 8J' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountRefusee8j",
            COUNT(CASE WHEN statut = 'SEJOUR EN COURS' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountSejourEnCours",
            COUNT(CASE WHEN statut = 'TERMINEE' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountTerminee",
            COUNT(CASE WHEN statut = 'TRANSMISE 8J' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountTransmise8j",
            COUNT(CASE WHEN statut = 'VALIDEE 8J' THEN 1 ELSE NULL END)::INTEGER AS "sejourCountValide8j"
      FROM front.demande_sejour
      GROUP BY organisme_id
    ),
    agrement_data AS (
      SELECT o.id AS "organismeId",
            CASE
              WHEN o.type_organisme = 'personne_morale' AND (o.personne_morale ->> 'porteurAgrement')::BOOLEAN IS FALSE THEN (
                SELECT JSON_BUILD_OBJECT('numero', numero, 'regionObtention', region_obtention, 'dateObtention', date_obtention,
                                          'file', file, 'yearObtention', EXTRACT(YEAR FROM a.date_obtention)) AS "agrement"
                FROM front.agrements a
                JOIN front.organismes o2 ON o2.id = a.organisme_id
                WHERE (o2.personne_morale ->> 'siret') = (o.personne_morale #>> '{etablissementPrincipal, siret}')
                  AND a.supprime = FALSE
              )
              ELSE (
                SELECT JSON_BUILD_OBJECT('numero', numero, 'regionObtention', region_obtention, 'dateObtention', date_obtention,
                                          'file', file, 'yearObtention', EXTRACT(YEAR FROM a.date_obtention)) AS "agrement"
                FROM front.agrements a
                WHERE organisme_id = o.id AND a.supprime = FALSE
              )
            END AS "agrement"
      FROM front.organismes o
    )
    SELECT o.id AS "organismeId", o.type_organisme AS "typeOrganisme", o.complet AS "complet",
          o.personne_morale ->> 'siren' AS "siren", o.personne_morale ->> 'siret' AS "siret",
          o.personne_morale ->> 'email' AS "email", o.personne_morale ->> 'raisonSociale' AS "raisonSociale",
          o.personne_physique ->> 'telephone' AS "telephone", o.personne_physique ->> 'nomNaissance' AS "nomPersonnePhysique",
          o.personne_physique ->> 'prenom' AS "prenomPersonnePhysique",
          COALESCE(stat."sejourCount", 0) AS "sejourCount", COALESCE(stat."sejourCountTransmise", 0) AS "sejourCountTransmise",
          COALESCE(stat."sejourCountAbamdonnee", 0) AS "sejourCountAbamdonnee", COALESCE(stat."sejourCountAnnulee", 0) AS "sejourCountAnnulee",
          COALESCE(stat."sejourCountAttente8j", 0) AS "sejourCountAttente8j", COALESCE(stat."sejourCountAModifier", 0) AS "sejourCountAModifier",
          COALESCE(stat."sejourCountAModifier8j", 0) AS "sejourCountAModifier8j", COALESCE(stat."sejourCountEnCours", 0) AS "sejourCountEnCours",
          COALESCE(stat."sejourCountEnCours8j", 0) AS "sejourCountEnCours8j", COALESCE(stat."sejourCountRefusee", 0) AS "sejourCountRefusee",
          COALESCE(stat."sejourCountRefusee8j", 0) AS "sejourCountRefusee8j", COALESCE(stat."sejourCountSejourEnCours", 0) AS "sejourCountSejourEnCours",
          COALESCE(stat."sejourCountTerminee", 0) AS "sejourCountTerminee", COALESCE(stat."sejourCountTransmise8j", 0) AS "sejourCountTransmise8j",
          COALESCE(stat."sejourCountValide8j", 0) AS "sejourCountValide8j",
          ad."agrement", o.edited_at AS "editedAt"
    FROM front.organismes o
    LEFT JOIN stat ON stat.organisme_id = o.id
    LEFT JOIN agrement_data ad ON ad."organismeId" = o.id
    WHERE o.supprime = FALSE
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
  getSiret: `
    SELECT
        personne_morale ->> 'siret' as siret
    FROM
        FRONT.ORGANISMES
    WHERE id = $1
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const response =
      type === partOrganisme.PERSONNE_MORALE
        ? await client.query(query.create, [type, parametre, {}])
        : await client.query(query.create, [type, {}, parametre]);
    const { organismeId } = response && response.rows[0];
    const responseNew =
      type === partOrganisme.PERSONNE_MORALE
        ? await PersonneMorale.createOrUpdate(client, organismeId, parametre)
        : await PersonnePhysique.createOrUpdate(client, organismeId, parametre);
    log.d("create - ", { responseNew });

    await client.query("COMMIT");
    log.d("create - DONE", { organismeId });
    return organismeId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

  const regions = await Regions.fetch();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    switch (type) {
      case partOrganisme.PERSONNE_MORALE: {
        const complet =
          await Organisme.schema(regions).personneMorale.isValid(parametre);
        await client.query(query.updatePersonne, [
          organismeId,
          type,
          parametre,
          {},
          complet,
        ]);
        await PersonneMorale.createOrUpdate(client, organismeId, parametre);
        break;
      }
      case partOrganisme.PERSONNE_PHYSIQUE: {
        const complet =
          await Organisme.schema(regions).personnePhysique.isValid(parametre);
        await client.query(query.updatePersonne, [
          organismeId,
          type,
          {},
          parametre,
          complet,
        ]);
        await PersonnePhysique.createOrUpdate(client, organismeId, parametre);
        break;
      }
      case partOrganisme.PROTOCOLE_TRANSPORT: {
        const complet =
          await Organisme.schema(regions).protocoleTransport.isValid(parametre);
        await client.query(query.updateTransport, [
          organismeId,
          parametre,
          complet,
        ]);
        await ProtocoleTransport.createOrUpdate(client, organismeId, parametre);
        break;
      }
      case partOrganisme.PROTOCOLE_SANITAIRE: {
        const complet =
          await Organisme.schema(regions).protocoleSanitaire.isValid(parametre);
        await client.query(query.updateSanitaire, [
          organismeId,
          parametre,
          complet,
        ]);
        await ProtocoleSanitaire.createOrUpdate(client, organismeId, parametre);
        break;
      }
      default:
        log.d("wrong type");
        return null;
    }

    await client.query("COMMIT");
    log.i("update - DONE");
    return organismeId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports.finalize = async function (userId) {
  log.i("finalize - IN", { userId });
  const regions = await Regions.fetch();

  const organismeSchema = Organisme.schema(regions);

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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(...query.finalize(organisme));
    organisme.type === partOrganisme.PERSONNE_MORALE
      ? await PersonneMorale.createOrUpdate(
          client,
          organisme.organismeId,
          organisme.personneMorale,
        )
      : await PersonnePhysique.createOrUpdate(
          client,
          organisme.organismeId,
          organisme.personnePhysique,
        );
    await ProtocoleTransport.createOrUpdate(
      client,
      organisme.organismeId,
      organisme.protocoleTransport,
    );
    await ProtocoleSanitaire.createOrUpdate(
      client,
      organisme.organismeId,
      organisme.protocoleSanitaire,
    );
    await client.query("COMMIT");
    log.i("finalize - DONE");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

module.exports.getListe = async (queryParams) => {
  log.i("get - IN");
  const titles = [
    {
      key: "o.complet",
      queryKey: "complet",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "o.edited_at",
      queryKey: "editedAt",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ad.agrement ->> 'regionObtention'",
      queryKey: "agrement-regionObtention",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ad.agrement ->> 'dateObtention'",
      queryKey: "agrement-dateObtention",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "o.personne_morale ->> 'siret'",
      queryKey: "siret",
      sortEnabled: true,
      type: "default",
    },
    {
      query: (index) => `
        (
          (o.type_organisme = 'personne_morale' AND o.personne_morale->>'raisonSociale' ILIKE '%' ||  unaccent($${index}) || '%')
            OR
          (o.type_organisme = 'personne_physique' AND o.personne_physique->>'nomUsage' ILIKE '%' ||  unaccent($${index}) || '%')
        )
      `,
      queryKey: "name",
      type: "custom",
    },
    {
      key: '"sejourCount"',
      queryKey: "sejourCount",
      sortEnabled: true,
    },
  ];
  const filterParams = sanitizeFiltersParams(queryParams, titles);
  const queryGet = query.getListe();
  const filterQuery = applyFilters(queryGet, [], filterParams);
  const { limit, offset, sortBy, sortDirection } = sanitizePaginationParams(
    queryParams,
    titles,
  );
  const paginatedQuery = applyPagination(
    filterQuery.query,
    filterQuery.params,
    limit,
    offset,
    sortBy,
    sortDirection,
  );
  const result = await Promise.all([
    pool.query(paginatedQuery.query, paginatedQuery.params),
    pool.query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  return {
    rows: result[0].rows,
    total: parseInt(result[1].rows[0].total, 10),
  };
};

module.exports.getListeExtract = async () => {
  log.i("getListeExtract - IN");
  const { rows: organismes } = await pool.query(query.getListeExtract(), []);
  log.i("getListeExtract - DONE");
  return organismes ?? [];
};

module.exports.getNonAgrees = async () => {
  log.i("getNonAgrees - IN");
  const { rows: organismes } = await pool.query(query.getNonAgrees, []);
  log.i("getNonAgrees - DONE");
  return organismes ?? [];
};

module.exports.getIsComplet = async (organismeId) => {
  const { rows: isComplet } = await pool.query(query.getIsComplet, [
    organismeId,
  ]);
  return isComplet?.[0].complet ?? false;
};

module.exports.getSiret = async (organismeId) => {
  const { rows: siret } = await pool.query(query.getSiret, [organismeId]);
  return siret?.[0].siret ?? null;
};
