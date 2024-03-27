/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const getHebergementWhereQuery = (hebergementIds) =>
  hebergementIds
    .map(
      (h) => `DS.HEBERGEMENT -> 'hebergements' @> '[{"hebergementId":${h}}]'`,
    )
    .join(" OR ");

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
  get: `
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
      ds.projet_sejour as "projetSejour",
      ds.sanitaires as "sanitaires",
      ds.files as "files",
      ds.attestation as "attestation",
      o.personne_morale->>'siret' as "siret"
    FROM front.demande_sejour ds
    JOIN front.organismes o ON o.id = ds.organisme_id
    JOIN front.user_organisme uo ON uo.org_id = o.id
    WHERE
      uo.use_id = $1
    `,
  getByAdminId: (search, hebergementIds) => `
    SELECT
      ds.id as "demandeSejourId",
      ds.created_at as "createdAt",
      ds.statut as "statut",
      ds.organisme_id as "organismeId",
      ds.libelle as "libelle",
      ds.date_debut::text as "dateDebut",
      ds.date_fin::text as "dateFin",
      ds.organisme as "organisme",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.type_organisme as "typeOrganisme",
      (DS.HEBERGEMENT -> 'hebergements')[0] ->> 'hebergementId' IN ('${hebergementIds.join("','")}') as "estInstructeurPrincipal"
    FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
    WHERE  (${getHebergementWhereQuery(hebergementIds)})
       ${search.map((s) => ` AND ${s} `).join("")}
    `,
  getByAdminIdTotal: (search, hebergementIds) => `
  SELECT COUNT(DISTINCT ds.id)
    FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
    WHERE (${getHebergementWhereQuery(hebergementIds)})
       ${search.map((s) => ` AND ${s} `).join("")}
    `,
  getById: (hebergementIds) => `
    SELECT
      ds.id as "demandeSejourId",
      ds.statut as "statut",
      ds.organisme_id as "organismeId",
      ds.libelle as "libelle",
      ds.date_debut::text as "dateDebut",
      ds.date_fin::text as "dateFin",
      ds.duree as "duree",
      ds.vacanciers as "vacanciers",
      ds.personnel as "personnel",
      ds.transport as "transport",
      ds.projet_sejour as "projetSejour",
      ds.sanitaires as "sanitaires",
      ds.attestation,
      ds.organisme as "organismes",
      ds.hebergement as "hebergement",
      o.personne_morale as "personneMorale",
      o.personne_physique as "personnePhysique",
      o.type_organisme as "typeOrganisme",
      ds.created_at as "createdAt",
      ds.edited_at as "editedAt"
    FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
    where (${getHebergementWhereQuery(hebergementIds)}) AND ds.id = $1
  `,
  getDepartementByDep: (departement_codes) => `
  SELECT *
  FROM FRONT.HEBERGEMENT
  WHERE
   (${departement_codes.map((code) => `coordonnees -> 'adresse' ->> 'departement' = '${code}'`).join(" OR ")})
  `,
  getEmailCcList: `
  SELECT u.mail AS mail
  FROM front.users u
  JOIN front.user_organisme uo ON u.id = uo.use_id
  JOIN front.organismes o ON uo.org_id = o.id
  WHERE
    o.personne_morale->>'siren' = $1 AND
    o.personne_morale->>'siegeSocial' = 'true'
`,
  getEmailToList: `
  SELECT u.mail AS mail
  FROM front.users u
  JOIN front.user_organisme uo ON u.id = uo.use_id
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
      ds.periode as "periode",
      ds.date_debut::text as "dateDebut",
      ds.date_fin::text as "dateFin",
      ds.responsable_sejour as "responsableSejour",
      ds.duree,
      ds.vacanciers as "informationsVacanciers",
      ds.personnel as "informationsPersonnel",
      ds.projet_sejour as "informationsProjetSejour",
      ds.transport as "informationsTransport",
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
  insertEvent: `
  INSERT INTO front.demande_sejour_history(
    source,
    demande_sejour_id,
    usager_user_id,
    type,
    type_precision,
    metadata,
    created_at,
    edited_at
  )
  VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
  RETURNING
    id as "eventId"
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
    organisme,
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
      organisme = $7,
      edited_at = NOW()
    WHERE
      ds.id = $8
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
      organisme,
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
};

module.exports.create = async (
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
) => {
  log.i("create - IN");
  const response = await pool.query(
    ...query.create(
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
    ),
  );
  log.d(response);
  const { demandeId } = response.rows[0];
  log.d("create - DONE", { demandeId });
  return demandeId;
};

module.exports.get = async (userId) => {
  log.i("get - IN", { userId });
  const response = await pool.query(query.get, [userId]);
  log.d("get - DONE");
  const demandes = response.rows;
  return demandes;
};

module.exports.getOne = async (criterias = {}) => {
  log.i("getOne - IN", { criterias });
  const { rows: demandes, rowCount } = await pool.query(
    ...query.getOne(criterias),
  );
  if (rowCount === 0) {
    log.i("getOne - DONE");
    return null;
  }
  log.i("getOne - DONE");
  return demandes[0];
};

module.exports.getByAdminId = async (
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
  departement_codes,
) => {
  const searchQuery = [];

  const possibleHebergementsIds =
    (await pool.query(query.getDepartementByDep(departement_codes)))?.rows?.map(
      (h) => h.id,
    ) ?? [];

  if (possibleHebergementsIds.length === 0) {
    return {
      demandes_sejour: [],
      total: 0,
    };
  }

  // Search management
  if (search?.libelle && search.libelle.length) {
    searchQuery.push(`libelle ilike '%${search.libelle}%'`);
  }
  if (search?.organisme && search.organisme.length) {
    searchQuery.push(`(
      personne_morale ->> 'raisonSociale' ilike '%${search.organisme}%'
      OR personne_physique ->> 'prenom' ilike '%${search.organisme}%'
      OR personne_physique ->> 'nomUsage' ilike '%${search.organisme}%'
      )`);
  }
  if (search?.statut && search.statut.length) {
    searchQuery.push(`statut = '${search.statut}'`);
  }

  if (search?.estInstructeurPrincipal === true) {
    searchQuery.push(
      `(DS.HEBERGEMENT -> 'hebergements')[0] ->> 'hebergementId' IN ('${possibleHebergementsIds.join("','")}')`,
    );
  }

  if (search?.estInstructeurPrincipal === false) {
    searchQuery.push(
      `(DS.HEBERGEMENT -> 'hebergements')[0] ->> 'hebergementId' NOT IN ('${possibleHebergementsIds.join("','")}')`,
    );
  }

  let queryWithPagination = query.getByAdminId(
    searchQuery,
    possibleHebergementsIds,
  );

  // Order management
  if (sortBy && sortDirection) {
    queryWithPagination += `
    ORDER BY "${sortBy}" ${sortDirection}, "createdAt" DESC
    `;
  } else {
    queryWithPagination += '\n ORDER BY "createdAt" DESC';
  }

  // Pagination management
  if (limit != null && offset != null) {
    queryWithPagination += `
    OFFSET ${offset}
    LIMIT ${limit}
    `;
  }

  const response = await pool.query(queryWithPagination);
  const total = await pool.query(
    query.getByAdminIdTotal(searchQuery, possibleHebergementsIds),
  );

  log.d("getByAdminId - DONE");
  return {
    demandes_sejour: response.rows,
    total: total.rows.find((t) => t.count)?.count ?? 0,
  };
};

module.exports.getById = async (demandeId, departement_codes) => {
  log.i("getById - IN", { demandeId });

  const possibleHebergementsIds =
    (await pool.query(query.getDepartementByDep(departement_codes)))?.rows?.map(
      (h) => h.id,
    ) ?? [];

  if (possibleHebergementsIds.length === 0) {
    return {
      demandes_sejour: [],
      total: 0,
    };
  }
  const { rows: demande } = await pool.query(
    query.getById(possibleHebergementsIds),
    [demandeId],
  );
  log.d("getById - DONE");
  log.d(demande);
  return demande[0];
};

module.exports.update = async (type, demandeSejourId, parametre) => {
  log.w("update - IN", { demandeSejourId, parametre, type });
  let response;
  switch (type) {
    case "organisme": {
      const { organismeId } = parametre;
      response = await pool.query(query.updateOrganisme, [
        organismeId,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsGenerales": {
      const {
        libelle,
        dateDebut,
        dateFin,
        duree,
        periode,
        responsableSejour,
        organisme,
      } = parametre;
      response = await pool.query(
        ...query.updateInformationsGenerales(
          libelle,
          dateDebut,
          dateFin,
          duree,
          periode,
          responsableSejour,
          organisme,
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
      log.d("informationsProjetSejour", demandeSejourId);
      response = await pool.query(query.updateInformationsPersonnel, [
        parametre,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsProjetSejour": {
      log.d("informationsProjetSejour", demandeSejourId);
      response = await pool.query(query.updateInformationsProjetSejour, [
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
  log.d("update - DONE");
  const demandeId = response.rows[0].demandeId ?? null;
  return demandeId;
};

module.exports.finalize = async (
  demandeSejourId,
  departementSuivi,
  idFonctionnelle,
  {
    informationsVacanciers,
    informationsPersonnel,
    informationsProjetSejour,
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
      informationsProjetSejour,
      informationsSanitaires,
      informationsTransport,
      informationsVacanciers,
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
      informationsProjetSejour,
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
  log.d("getNextIndex - DONE");
  return data[0].index ?? null;
};
module.exports.getEmailToList = async (organismeId) => {
  log.i("getEmailToList - IN", organismeId);
  const { rows: data } = await pool.query(query.getEmailToList, [organismeId]);
  log.d("getEmailToList - DONE");
  return data.map((m) => m.mail).join(",") ?? null;
};
module.exports.getEmailCcList = async (siren) => {
  log.i("getEmailCcList - IN", siren);
  const { rows: data } = await pool.query(query.getEmailCcList, [siren]);
  log.d("getEmailCcList - DONE");
  return data.map((m) => m.mail).join(",") ?? null;
};
module.exports.insertEvent = async (
  source,
  declarationId,
  userId,
  type,
  typePrecision,
  metaData,
) => {
  log.i("insertEvent - IN");
  const { rows: response } = await pool.query(query.insertEvent, [
    source,
    declarationId,
    userId,
    type,
    typePrecision,
    metaData,
  ]);
  log.d("insertEvent - DONE");
  return response[0].eventId ?? null;
};

module.exports.addFile = async (declarationId, file) => {
  log.i("addFile - IN", { declarationId });
  const { rows: response } = await pool.query(query.addFile, [
    declarationId,
    file,
  ]);
  log.d("addFile - DONE");
  return response[0].declarationId;
};
