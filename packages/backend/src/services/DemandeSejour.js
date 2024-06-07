/* eslint-disable no-param-reassign */
const dayjs = require("dayjs");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const getDepartementWhereQuery = (departementCodes, params) => {
  return `jsonb_path_query_array(hebergement, '$.hebergements[*].coordonnees.adresse.departement') ?| ($${params.length})::text[]`;
};

/* see: https://day.js.org/docs/en/display/difference
     if dateDebut = 2021-12-01 and dateFin = 2012-12-03, dayjs(dateFin).diff(dateDebut, "day") will return 2
     because it does a diff between 2021-12-01 00:00:00 and 2021-12-03 00:00:00. It would be the same with
     2021-12-01 00:00:00 and 2021-12-03 23:59:59 because it truncate to zero decimal places.
     So we must add 1 to have the good result
   */
const getDuree = (dateDebut, dateFin) =>
  (dayjs(dateFin).diff(dateDebut, "day") + 1).toString();

const query = {
  addFile: `
    UPDATE front.demande_sejour
    SET files = $2
    WHERE id = $1
    RETURNING id as "declarationId"
  `,
  create: (
    organismeId,
    libelle,
    dateDebut,
    dateFin,
    duree,
    periode,
    responsableSejour,
    protocoleTransport,
    protocoleSanitaire,
    organisme,
  ) => [
    `
  INSERT INTO front.demande_sejour(
    statut,
    organisme_id,
    libelle,
    date_debut,
    date_fin,
    duree,
    periode,
    responsable_sejour,
    transport,
    sanitaires,
    organisme,
    files
  )
  VALUES ('BROUILLON',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  RETURNING
      id as "demandeId"
  ;`,
    [
      organismeId,
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      responsableSejour,
      protocoleTransport,
      protocoleSanitaire,
      organisme,
      [],
    ],
  ],
  finalize: (
    demandeSejourId,
    idFonctionnelle,
    departementSuivi,
    vacanciers,
    personnel,
    projetSejour,
    transport,
    sanitaires,
    hebergement,
    attestation,
  ) => [
    `
UPDATE front.demande_sejour ds
SET
  id_fonctionnelle = $2,
  departement_suivi = $3,
  statut = 'TRANSMISE',
  vacanciers = $4,
  personnel = $5,
  projet_sejour = $6,
  transport = $7,
  sanitaires = $8,
  hebergement = $9,
  attestation = $10,
  edited_at = NOW()
WHERE
  ds.id = $1
RETURNING
  id as "demandeId"
;`,
    [
      demandeSejourId,
      idFonctionnelle,
      departementSuivi,
      vacanciers,
      personnel,
      projetSejour,
      transport,
      sanitaires,
      hebergement,
      attestation,
    ],
  ],
  finalize8jours: (
    demandeSejourId,
    vacanciers,
    personnel,
    hebergement,
    attestation,
  ) => [
    `
UPDATE front.demande_sejour ds
SET
  statut = 'TRANSMISE 8J',
  vacanciers = $2,
  personnel = $3,
  hebergement = $4,
  attestation = $5,
  edited_at = NOW()
WHERE
  ds.id = $1
RETURNING
  id as "demandeId"
;`,
    [demandeSejourId, vacanciers, personnel, hebergement, attestation],
  ],
  get: (organismeIds) => [
    `
SELECT
  ds.id as "demandeSejourId",
  ds.statut as "statut",
  ds.id_fonctionnelle as "idFonctionnelle",
  ds.departement_suivi as "departementSuivi",
  ds.organisme_id as "organismeId",
  ds.libelle as "libelle",
  ds.periode as "periode",
  ds.date_debut::text as "dateDebut",
  ds.date_fin::text as "dateFin",
  ds.created_at as "createdAt",
  ds.edited_at as "editedAt",
  ds.duree as "duree",
  ds.vacanciers as "vacanciers",
  ds.personnel as "personnel",
  ds.transport as "transport",
  COALESCE(ds.projet_sejour, '{}'::jsonb) as "projetSejour",
  ds.sanitaires as "sanitaires",
  ds.files as "files",
  ds.attestation as "attestation",
  o.personne_morale->>'siret' as "siret",
  o.personne_morale->'etablissementPrincipal' as "organismeAgree"
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
WHERE
  o.id  = ANY ($1)
`,
    [organismeIds],
  ],
  getByDepartementCodes: (search, territoireCode, departementQuery, params) => {
    return `
SELECT
  ds.id as "demandeSejourId",
  ds.created_at as "createdAt",
  ds.statut as "statut",
  ds.organisme_id as "organismeId",
  ds.libelle as "libelle",
  ds.date_debut::text as "dateDebut",
  ds.date_fin::text as "dateFin",
  ds.organisme as "organisme",
  ds.id_fonctionnelle as "idFonctionnelle",
  o.personne_morale as "personneMorale",
  o.personne_physique as "personnePhysique",
  o.type_organisme as "typeOrganisme",
  ds.hebergement #>> '{hebergements, 0, coordonnees, adresse, departement}' = ANY ($${params.length}) as "estInstructeurPrincipal"
FROM front.demande_sejour ds
  JOIN front.organismes o ON o.id = ds.organisme_id
  LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
WHERE
  statut <> 'BROUILLON'
  AND ((${departementQuery})
  OR a.region_obtention = '${territoireCode}')
  ${search.map((s) => ` AND ${s} `).join("")}
`;
  },
  getByDepartementCodesTotal: (search, territoireCode, departementQuery) => {
    return `
SELECT COUNT(DISTINCT ds.id)
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
WHERE
  statut <> 'BROUILLON'
  AND ((${departementQuery})
  OR a.region_obtention = '${territoireCode}')
  ${search.map((s) => ` AND ${s} `).join("")}
`;
  },
  getById: (territoireCode, departementQuery, params) => {
    return [
      `
    SELECT
      ds.id as "demandeSejourId",
      ds.statut as "statut",
      ds.organisme_id as "organismeId",
      ds.id_fonctionnelle as "idFonctionnelle",
      ds.departement_suivi as "departementSuivi",
      ds.libelle as "libelle",
      ds.date_debut::text as "dateDebut",
      ds.date_fin::text as "dateFin",
      ds.duree as "duree",
      ds.periode as "periode",
      ds.responsable_sejour as "responsableSejour",
      ds.vacanciers as "informationsVacanciers",
      ds.personnel as "informationsPersonnel",
      ds.transport as "informationsTransport",
      COALESCE(ds.projet_sejour, '{}'::jsonb) as "projetSejour",
      ds.sanitaires as "informationsSanitaires",
      ds.attestation,
      ds.hebergement as "hebergement",
      ds.organisme as "organisme",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.type_organisme as "typeOrganisme",
      ds.files as "files",
      ds.hebergement #>> '{hebergements, 0, coordonnees, adresse, departement}' = ANY ($${params.length}) as "estInstructeurPrincipal",
      ds.created_at as "createdAt",
      ds.edited_at as "editedAt"
    FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
      LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
    where ((${departementQuery})
      OR a.region_obtention = '${territoireCode}')
      AND ds.id = $1
`,
      params,
    ];
  },
  getEmailBack: `
WITH
  roles AS
  (
    SELECT array_agg(id) as ids
    from back.roles
    WHERE label IN ('DemandeSejour_Ecriture')
  ),
  users AS
  (
    SELECT u.mail AS mail, array_agg(ur.rol_id) as ids
    FROM back.users u
    JOIN back.user_roles ur ON u.id = ur.use_id
    WHERE u.ter_code = $1
    GROUP BY mail
  )
SELECT mail
FROM
  roles r,
  users u
WHERE u.ids && r.ids
`,
  getEmailBackCc: `
WITH
  roles AS
  (
    SELECT array_agg(id) as ids
    from back.roles
    WHERE label IN ('DemandeSejour_Ecriture')
  ),
  regions AS
  (
    SELECT
      ARRAY_AGG(distinct parent_code) as parent_code
    FROM geo.territoires
    WHERE code = ANY($1)
  ),
  users AS
  (
    SELECT u.mail AS mail, array_agg(ur.rol_id) as ids
    FROM regions r, back.users u
    JOIN back.user_roles ur ON u.id = ur.use_id
    WHERE u.ter_code = ANY($1)
      OR u.ter_code = ANY(r.parent_code)
      OR u.ter_code = 'FRA'
    GROUP BY mail
  )
SELECT mail
FROM roles r, users u
WHERE u.ids && r.ids
`,
  getEmailCcList: `
SELECT DISTINCT u.mail AS mail
FROM front.users u
JOIN front.user_organisme uo ON u.id = uo.use_id
JOIN front.organismes o ON uo.org_id = o.id
WHERE
  o.personne_morale->>'siren' = $1 AND
  o.personne_morale->>'siegeSocial' = 'true'
`,
  getEmailToList: `
SELECT DISTINCT u.mail AS mail
FROM front.users u
JOIN front.user_organisme uo
  ON u.id = uo.use_id
WHERE uo.org_id = $1
`,
  getNextIndex: `
SELECT nextval('front.seq_declaration_sejour') AS index
`,
  getOne: (criterias) => [
    `
SELECT
  ds.id,
  ds.statut,
  ds.organisme_id as "organismeId",
  ds.id_fonctionnelle as "idFonctionnelle",
  ds.departement_suivi as "departementSuivi",
  ds.libelle as "libelle",
  ds.date_debut::text as "dateDebut",
  ds.date_fin::text as "dateFin",
  ds.duree,
  ds.periode as "periode",
  ds.responsable_sejour as "responsableSejour",
  ds.vacanciers as "informationsVacanciers",
  ds.personnel as "informationsPersonnel",
  ds.transport as "informationsTransport",
  COALESCE(ds.projet_sejour, '{}'::jsonb) as "projetSejour",
  ds.sanitaires as "informationsSanitaires",
  ds.hebergement as "hebergement",
  ds.organisme as "organisme",
  ds.files as "files",
  ds.attestation as "attestation",
  o.personne_morale->>'siret' as "siret",
  ds.edited_at as "editedAt"
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
WHERE 1=1
${Object.keys(criterias)
  .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
  .join(" ")}
`,
    Object.values(criterias),
  ],
  historique: `
SELECT
  h.id as "historiqueId",
  h.source as "source",
  h.demande_sejour_id as "declarationId",
  CASE WHEN u.id IS NOT null then u.mail ELSE bu.mail END as "userEmail",
  h.bo_user_id as "userAdminId",
  h.type as "type",
  h.type_precision as "typePrecision",
  h.metadata as "metaData",
  h.created_at as "createdAt"
FROM front.demande_sejour_history h
LEFT JOIN front.users u ON u.id = h.usager_user_id
LEFT JOIN back.users bu  on bu.id = h.bo_user_id
WHERE
  h.demande_sejour_id = $1
`,
  insertEvent: `
  INSERT INTO front.demande_sejour_history(
    source,
    demande_sejour_id,
    usager_user_id,
    bo_user_id,
    type,
    type_precision,
    metadata,
    created_at,
    edited_at
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
  RETURNING
    id as "eventId"
  `,
  saveDS2M: `
  UPDATE front.demande_sejour
  SET declaration_2m = $2
  WHERE id = $1
  RETURNING id as "declarationId"
`,
  updateHebergement: `
  UPDATE front.demande_sejour ds
  SET
    hebergement = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "demandeId"
    `,
  updateInformationsGenerales: (
    libelle,
    dateDebut,
    dateFin,
    duree,
    periode,
    responsableSejour,
    demandeSejourId,
  ) => [
    `
UPDATE front.demande_sejour ds
SET
  libelle = $1,
  date_debut = $2,
  date_fin = $3,
  duree = $4,
  periode = $5,
  responsable_sejour = $6,
  edited_at = NOW()
WHERE
  ds.id = $7
RETURNING
  id as "demandeId"
`,
    [
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      responsableSejour,
      demandeSejourId,
    ],
  ],
  updateInformationsPersonnel: `
UPDATE front.demande_sejour ds
SET
  personnel = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "demandeId"
`,
  updateInformationsProjetSejour: `
UPDATE front.demande_sejour ds
SET
  projet_sejour = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "demandeId"
`,
  updateInformationsSanitaires: `
UPDATE front.demande_sejour ds
SET
  sanitaires = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "demandeId"
`,
  updateInformationsTransport: `
UPDATE front.demande_sejour ds
SET
  transport = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "demandeId"
`,
  updateInformationsVacanciers: `
  UPDATE front.demande_sejour ds
  SET
    vacanciers = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "demandeId"
  `,
  updateOrganisme: `
  UPDATE front.demande_sejour ds
  SET
    organisme_id = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "demandeId"
  `,
  updateProjetSejour: `
  UPDATE front.demande_sejour ds
  SET
    projet_sejour = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "demandeId"
  `,
  updateStatut: `
UPDATE front.demande_sejour ds
SET
  statut = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "demandeId"
`,
};

module.exports.create = async ({
  libelle,
  dateDebut,
  dateFin,
  responsableSejour,
  organisme,
}) => {
  log.i("create - IN");
  const organismeId = organisme.organismeId;

  const duree = getDuree(dateDebut, dateFin);

  const periode = (() => {
    const moisDebut = dayjs(dateDebut).month();
    if (moisDebut < 3) return "hiver";
    if (moisDebut < 6) return "printemps";
    if (moisDebut < 9) return "été";
    if (moisDebut < 12) return "automne";
  })();

  const response = await pool.query(
    ...query.create(
      organismeId,
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      responsableSejour,
      organisme.protocoleTransport,
      organisme.protocoleSanitaire,
      organisme,
    ),
  );
  log.d(response);
  const { demandeId } = response.rows[0];
  log.i("create - DONE", { demandeId });
  return demandeId;
};

module.exports.get = async (organismesId) => {
  log.i("get - IN", { organismesId });
  const response = await pool.query(...query.get(organismesId));
  log.i("get - DONE");
  const demandes = response.rows;
  return demandes;
};

module.exports.getOne = async (criterias = {}) => {
  log.i("getOne - IN", { criterias });
  const { rows: demandes, rowCount } = await pool.query(
    ...query.getOne(criterias),
  );
  if (rowCount !== 1) {
    log.w("getOne - DONE with unexpected result", { rowCount });
    return null;
  }
  log.i("getOne - DONE");
  return demandes[0];
};

module.exports.getByDepartementCodes = async (
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
  territoireCode,
  departementCodes,
) => {
  if (departementCodes && departementCodes.length === 0) {
    return {
      demandes_sejour: [],
      total: 0,
    };
  }

  log.i("getByDepartementCodes - IN");

  const params = [];
  const searchQuery = [];

  // Search management
  if (search?.idFonctionnelle && search.idFonctionnelle.length) {
    searchQuery.push(`id_fonctionnelle ilike $${params.length + 1}`);
    params.push(`%${search.idFonctionnelle}%`);
  }
  if (search?.libelle && search.libelle.length) {
    searchQuery.push(`libelle ilike $${params.length + 1}`);
    params.push(`%${search.libelle}%`);
  }
  if (search?.organisme && search.organisme.length) {
    searchQuery.push(`(
      personne_morale ->> 'raisonSociale' ilike $${params.length + 1}
      OR personne_physique ->> 'prenom' ilike $${params.length + 2}
      OR personne_physique ->> 'nomUsage' ilike $${params.length + 3}
      )`);
    params.push(
      `%${search.organisme}%`,
      `%${search.organisme}%`,
      `%${search.organisme}%`,
    );
  }
  if (search?.statut && search.statut.length) {
    searchQuery.push(`statut = $${params.length + 1}`);
    params.push(`${search.statut}`);
  }

  if (search?.estInstructeurPrincipal === true) {
    searchQuery.push(
      `ds.hebergement #>> '{hebergements, 0, coordonnees, adresse, departement}' = ANY ($${params.length + 1})`,
    );
    params.push(`{${departementCodes.join(",")}}`);
  }

  if (search?.estInstructeurPrincipal === false) {
    searchQuery.push(
      `NOT (ds.hebergement #>> '{hebergements, 0, coordonnees, adresse, departement}' = ANY ($${params.length + 1}))`,
    );
    params.push(`{${departementCodes.join(",")}}`);
  }

  /*
   * Cette Partie du code soit toujours etre appelé juste avant la fonction query.getByDepartementCodes
   * pour maintenir la coherence de l'ordre des paramètres dans les requetes
   * */
  params.push(departementCodes);
  const departementQuery = getDepartementWhereQuery(departementCodes, params);

  let queryWithPagination = query.getByDepartementCodes(
    searchQuery,
    territoireCode,
    departementQuery,
    params,
  );

  // Order management
  if (sortBy && sortDirection) {
    queryWithPagination += `ORDER BY "${sortBy}" ${sortDirection}, "createdAt" DESC`;
  } else {
    queryWithPagination += 'ORDER BY "createdAt" DESC';
  }

  const paramsWithPagination = [...params];
  // Pagination management
  if (limit != null && offset != null) {
    queryWithPagination += `
    OFFSET $${params.length + 1}
    LIMIT $${params.length + 2}
    `;
    paramsWithPagination.push(offset, limit);
  }

  log.d({ paramsWithPagination, queryWithPagination });

  const response = await pool.query(queryWithPagination, paramsWithPagination);

  if (limit === null || response.rowCount < limit) {
    return {
      demandes_sejour: response.rows,
      total: response.rowCount + parseInt(offset ?? 0),
    };
  }

  const total = await pool.query(
    query.getByDepartementCodesTotal(
      searchQuery,
      territoireCode,
      departementQuery,
    ),
    params,
  );

  log.i("getByDepartementCodes - DONE");
  return {
    demandes_sejour: response.rows,
    total: total.rows.find((t) => t.count)?.count ?? 0,
  };
};

module.exports.getById = async (
  demandeId,
  territoireCode,
  departementCodes,
) => {
  log.i("getById - IN", { demandeId });

  if (departementCodes && departementCodes.length === 0) {
    return;
  }

  const params = [demandeId, departementCodes];
  const departementQuery = getDepartementWhereQuery(departementCodes, params);

  const { rows: demande } = await pool.query(
    ...query.getById(territoireCode, departementQuery, params),
  );

  log.i("getById - DONE");
  log.d(demande);
  return demande[0];
};

module.exports.update = async (type, demandeSejourId, parametre) => {
  log.i("update - IN", { demandeSejourId, parametre, type });
  let response;

  switch (type) {
    case "informationsGenerales": {
      const { libelle, dateDebut, dateFin, responsableSejour } = parametre;

      const duree = getDuree(dateDebut, dateFin);

      const periode = (() => {
        const moisDebut = dayjs(dateDebut).month();
        if (moisDebut < 3) return "hiver";
        if (moisDebut < 6) return "printemps";
        if (moisDebut < 9) return "été";
        if (moisDebut < 12) return "automne";
      })();

      response = await pool.query(
        ...query.updateInformationsGenerales(
          libelle,
          dateDebut,
          dateFin,
          duree,
          periode,
          responsableSejour,
          demandeSejourId,
        ),
      );
      break;
    }
    case "informationsVacanciers": {
      log.d("informationsVacanciers", demandeSejourId);
      response = await pool.query(query.updateInformationsVacanciers, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsPersonnel": {
      log.d("informationsPersonnel", demandeSejourId);
      response = await pool.query(query.updateInformationsPersonnel, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    case "projetSejour": {
      log.d("projetSejour", demandeSejourId);
      response = await pool.query(query.updateProjetSejour, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    case "protocole_transport": {
      log.d("protocole_transport", demandeSejourId);
      response = await pool.query(query.updateInformationsTransport, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      log.d("protocole_sanitaire", demandeSejourId);
      response = await pool.query(query.updateInformationsSanitaires, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    case "hebergements": {
      log.d("hebergements", demandeSejourId);
      response = await pool.query(query.updateHebergement, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    default:
      log.d("wrong type");
      return null;
  }
  log.i("update - DONE");
  const demandeId = response.rows[0].demandeId ?? null;
  return demandeId;
};

module.exports.finalize8jours = async (
  demandeSejourId,
  { informationsVacanciers, informationsPersonnel, hebergement, attestation },
) => {
  log.i("finalize - IN", {
    declaration: {
      attestation,
      hebergement,
      informationsPersonnel,
      informationsVacanciers,
    },
    demandeSejourId,
  });

  await pool.query(
    ...query.finalize8jours(
      demandeSejourId,
      informationsVacanciers,
      informationsPersonnel,
      hebergement,
      attestation,
    ),
  );
  log.i("finalize - DONE");
};

module.exports.finalize = async (
  demandeSejourId,
  departementSuivi,
  idFonctionnelle,
  {
    informationsVacanciers,
    informationsPersonnel,
    projetSejour,
    informationsTransport,
    informationsSanitaires,
    hebergement,
    attestation,
  },
) => {
  log.i("finalize - IN", {
    declaration: {
      attestation,
      hebergement,
      informationsPersonnel,
      informationsSanitaires,
      informationsTransport,
      informationsVacanciers,
      projetSejour,
    },
    demandeSejourId,
    departementSuivi,
    idFonctionnelle,
  });

  await pool.query(
    ...query.finalize(
      demandeSejourId,
      idFonctionnelle,
      departementSuivi,
      informationsVacanciers,
      informationsPersonnel,
      projetSejour,
      informationsTransport,
      informationsSanitaires,
      hebergement,
      attestation,
    ),
  );
  log.i("finalize - DONE");
};

module.exports.getNextIndex = async () => {
  log.i("getNextIndex - IN");
  const { rows: data } = await pool.query(query.getNextIndex);
  log.d(data[0].index);
  log.i("getNextIndex - DONE");
  return data[0].index ?? null;
};
module.exports.getEmailToList = async (organismeId) => {
  log.i("getEmailToList - IN", organismeId);
  const { rows: data } = await pool.query(query.getEmailToList, [organismeId]);
  log.i("getEmailToList - DONE");
  return data.map((m) => m.mail);
};

module.exports.getEmailCcList = async (siren) => {
  log.i("getEmailCcList - IN", siren);
  const { rows: data } = await pool.query(query.getEmailCcList, [siren]);
  log.i("getEmailCcList - DONE");
  return data.map((m) => m.mail);
};
module.exports.getEmailBack = async (departement) => {
  log.i("getEmailBack - IN", departement);
  const { rows: data } = await pool.query(query.getEmailBack, [departement]);
  log.i("getEmailBack - DONE");
  return data.map((m) => m.mail);
};
module.exports.getEmailBackCc = async (departements) => {
  log.i("getEmailBackCc - IN", departements);
  const { rows: data } = await pool.query(query.getEmailBackCc, [departements]);
  log.i("getEmailBackCc - DONE");
  return data.map((m) => m.mail);
};
module.exports.insertEvent = async (
  source,
  declarationId,
  userId,
  boUserId,
  type,
  typePrecision,
  metaData,
) => {
  log.i("insertEvent - IN");
  const { rows: response } = await pool.query(query.insertEvent, [
    source,
    declarationId,
    userId,
    boUserId,
    type,
    typePrecision,
    metaData,
  ]);
  log.i("insertEvent - DONE");
  return response[0].eventId ?? null;
};

module.exports.saveDS2M = async (declarationId, declaration) => {
  log.i("saveDS2M - IN");
  await pool.query(query.saveDS2M, [declarationId, declaration]);
  log.i("saveDS2M - DONE");
};

module.exports.addFile = async (declarationId, file) => {
  log.i("addFile - IN", { declarationId });
  const { rows: response } = await pool.query(query.addFile, [
    declarationId,
    file,
  ]);
  log.i("addFile - DONE");
  return response[0].declarationId;
};

module.exports.historique = async (declarationId) => {
  log.i("historique - IN", { declarationId });
  const { rows: response } = await pool.query(query.historique, [
    declarationId,
  ]);
  log.i("historique - DONE");
  return response;
};

module.exports.updateStatut = async (
  demandeSejourId,
  statut,
  event = null,
  cb = null,
) => {
  log.i("updateStatut - IN", { demandeSejourId, statut });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const response = await client.query(query.updateStatut, [
      statut,
      demandeSejourId,
    ]);
    await client.query(query.insertEvent, [
      event.source,
      event.declarationId,
      event.userId,
      event.boUserId,
      event.type,
      event.typePrecision,
      event.metaData,
    ]);
    if (cb) {
      await cb();
    }

    await client.query("COMMIT");
    const demandeId = response.rows[0].demandeId ?? null;
    log.i("updateStatut - DONE");

    return demandeId;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
