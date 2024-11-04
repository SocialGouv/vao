/* eslint-disable no-param-reassign */
const dayjs = require("dayjs");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const dsStatus = require("../helpers/ds-statuts");

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
  cancel: (declarationId, userId) => [
    `
    UPDATE front.demande_sejour d
    SET statut = 'ANNULEE'
    FROM front.organismes o, front.user_organisme uo
    WHERE
      o.id = d.organisme_id
      AND uo.org_id = o.id
      AND d.id = $1
      AND uo.use_id = $2;
    ;`,
    [declarationId, userId],
  ],
  copy: (
    organismeId,
    libelle,
    dateDebut,
    dateFin,
    duree,
    periode,
    responsableSejour,
    organisme,
    hebergement,
    vacanciers,
    personnel,
    transport,
    projet_sejour,
    sanitaires,
    files,
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
      organisme,
      hebergement,
      vacanciers,
      personnel,
      transport,
      projet_sejour,
      sanitaires,
      files
    )
    VALUES ('BROUILLON',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING
        id as "declarationId"
    ;`,
    [
      organismeId,
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      responsableSejour,
      organisme,
      hebergement,
      vacanciers,
      personnel,
      transport,
      projet_sejour,
      sanitaires,
      files,
    ],
  ],
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
      id as "declarationId"
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
  delete: (declarationId, userId) => [
    `
    DELETE FROM front.demande_sejour d
    USING front.organismes o, front.user_organisme uo
    WHERE
      o.id = d.organisme_id
      AND uo.org_id = o.id
      AND d.id = $1
      AND uo.use_id = $2
    ;`,
    [declarationId, userId],
  ],
  finalize: (
    declarationId,
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
  id as "declarationId"
;`,
    [
      declarationId,
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
    declarationId,
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
  id as "declarationId"
;`,
    [declarationId, vacanciers, personnel, hebergement, attestation],
  ],
  get: (organismeIds) => [
    `SELECT
  ds.id as "declarationId",
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
  ds.hebergement as "hebergements",
  COALESCE(ds.projet_sejour, '{}'::jsonb) as "projetSejour",
  ds.sanitaires as "sanitaires",
  ds.files as "files",
  ds.attestation as "attestation",
  o.personne_morale->>'siret' as "siret",
  o.personne_morale->'etablissementPrincipal' as "organismeAgree",
  dsm.message as "message",
  CASE
    WHEN (dsm.read_at IS NULL AND dsm.front_user_id IS NULL) THEN 'NON LU'
    WHEN (dsm.read_at IS NOT NULL AND dsm.front_user_id IS NULL) THEN 'LU'
    WHEN (dsm.back_user_id IS NULL) THEN 'REPONDU'
  END AS "messageEtat",
  CASE
    WHEN (dsm.read_at IS NULL AND dsm.front_user_id IS NULL) THEN 1 -- NON LU
    WHEN (dsm.read_at IS NOT NULL AND dsm.front_user_id IS NULL) THEN 2 -- LU
    WHEN (dsm.back_user_id IS NULL) THEN 3 -- REPONDU
  END AS "messageOrdreEtat",
  dsm.read_at AS "messageReadAt",
  dsm.created_at AS "messageCreatedAt",
  COALESCE(dsm.read_at, dsm.created_at) AS "messageLastAt"
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
      SELECT MAX(dsmax.id)
      FROM front.demande_sejour_message  dsmax
      WHERE dsmax.declaration_id = ds.id)
WHERE
  o.id = ANY ($1)
`,
    [organismeIds],
  ],
  getAdminStats: (departements, territoireCode) => [
    `
SELECT
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'EN COURS')::integer AS "enCours",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'TRANSMISE')::integer AS "transmis",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'TRANSMISE 8J')::integer AS "transmis8J",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'EN COURS 8J')::integer AS "enCours8J",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'EN ATTENTE DECLARATION 8 JOURS')::integer AS "declaration8J",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'VALIDEE 8J')::integer AS "validee8J",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'TERMINEE')::integer AS "terminee",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'ANNULEE')::integer AS "annulee",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'ABANDONNEE')::integer AS "abandonnee",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'REFUSEE')::integer AS "refusee",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut = 'REFUSEE 8J')::integer AS "refuse8J",
  COUNT(DISTINCT ds.id) FILTER (WHERE statut <> 'BROUILLON')::integer AS "global",
  COUNT(CASE WHEN (dsm.message is not null AND dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 1 END)::integer AS "nonlu",
  COUNT(CASE WHEN (dsm.message is not null AND dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 1 END)::integer AS "lu",
  COUNT(CASE WHEN (dsm.message is not null AND dsm.front_user_id IS NULL) THEN 1 END)::integer AS "repondu"
FROM
  front.demande_sejour ds
  JOIN front.organismes o ON o.id = ds.organisme_id
  LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
  LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
      SELECT MAX(dsmax.id)
      FROM front.demande_sejour_message  dsmax
      WHERE dsmax.declaration_id = ds.id)
WHERE
  jsonb_path_query_array(hebergement, '$.hebergements[*].coordonnees.adresse.departement') ?| ($1)::text[]
  OR a.region_obtention = '${territoireCode}'
`,
    [departements],
  ],
  getByDepartementCodes: (search, territoireCode, departementQuery, params) => {
    return `
SELECT
  ds.id as "declarationId",
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
  ds.hebergement #>> '{hebergements, 0, coordonnees, adresse, departement}' = ANY ($${params.length}) as "estInstructeurPrincipal",
  dsm.message as "message",
    CASE
      WHEN (dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 'NON LU'
      WHEN (dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 'LU'
      WHEN (dsm.front_user_id IS NULL) THEN 'REPONDU'
    END AS "messageEtat",
    CASE
      WHEN (dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 1 -- NON LU
      WHEN (dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 2 -- LU
      WHEN (dsm.front_user_id IS NULL) THEN 3 -- REPONDU
    END AS "messageOrdreEtat",
    dsm.read_at AS "messageReadAt",
    dsm.created_at AS "messageCreatedAt",
    COALESCE(dsm.read_at, dsm.created_at) AS "messageLastAt"
FROM front.demande_sejour ds
  JOIN front.organismes o ON o.id = ds.organisme_id
  LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
  LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
      SELECT MAX(dsmax.id)
      FROM front.demande_sejour_message  dsmax
      WHERE dsmax.declaration_id = ds.id)
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
LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id
WHERE
  statut <> 'BROUILLON'
  AND ((${departementQuery})
  OR a.region_obtention = '${territoireCode}')
  ${search.map((s) => ` AND ${s} `).join("")}
`;
  },
  getById: (declarationId, departements) => {
    return [
      `
    SELECT
      ds.id as "declarationId",
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
      ds.departement_suivi = ANY($2) as "estInstructeurPrincipal",
      ds.created_at as "createdAt",
      ds.edited_at as "editedAt"
    FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
      LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
    where ds.id = $1`,
      [declarationId, departements],
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
  getExtract: (departementQuery, territoireCode) => `
SELECT
  ds.id as id,
  ds.libelle as libelle,
  ds.date_debut::text as date_debut,
  ds.date_fin::text as date_fin,
  ds.organisme as organisme,
  ds.responsable_sejour->>'email' as responsable_sejour_email,
  ds.responsable_sejour->>'telephone' as responsable_sejour_telephone,
  ds.id_fonctionnelle as reference,
  ds.statut as statut,
  ds.created_at as created_at
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
WHERE ((${departementQuery})
  AND statut <> 'BROUILLON'
  OR a.region_obtention = '${territoireCode}')`,
  getHebergement: (demandeSejourId, departementCodes, hebergementIndex) => [
    `
SELECT
  ds.id AS demande_sejour_id,
  ds.date_debut AS date_sejour,
  ds.departement_suivi AS departement,
  h.hebergement AS hebergement
FROM
  front.demande_sejour ds,
  jsonb_array_elements(ds.hebergement -> 'hebergements') WITH ORDINALITY AS h(hebergement, ordinality)
WHERE
  ds.id = $1
  AND h.hebergement -> 'coordonnees' -> 'adresse' ->> 'departement' = ANY($2)
  AND ordinality = $3
    `,
    [demandeSejourId, departementCodes, hebergementIndex],
  ],
  getHebergementsByDepartementCodes: (
    departementCodes,
    { search, limit, offset, order, sort },
  ) => [
    `
  WITH filtered_hebergements AS (
    SELECT
      ds.id AS "declarationId",
      ds.date_debut as "dateSejour",
      ds.departement_suivi as departement,
      h.hebergement ->> 'nom' AS nom,
      h.hebergement ->> 'dateFin' AS "dateFin",
      h.hebergement ->> 'dateDebut' AS "dateDebut",
      h.hebergement -> 'coordonnees' ->> 'email' AS email,
      h.hebergement -> 'coordonnees' ->> 'numTelephone1' AS telephone,
      h.hebergement -> 'coordonnees' ->> 'nomGestionnaire' AS "nomGestionnaire",
      h.hebergement -> 'coordonnees' -> 'adresse'  AS adresse,
      h.hebergement -> 'informationsLocaux' ->> 'type' AS "typeHebergement",
      h.hebergement -> 'informationsLocaux' ->> 'visiteLocauxAt' AS "dateVisite",
      CASE
        WHEN h.hebergement -> 'informationsLocaux' ->> 'reglementationErp' = 'true' THEN TRUE
        WHEN h.hebergement -> 'informationsLocaux' ->> 'reglementationErp' = 'false' THEN FALSE
        ELSE NULL
      END AS "reglementationErp",
      ordinality AS "hebergementIndex"
    FROM
      front.demande_sejour ds,
      jsonb_array_elements(ds.hebergement -> 'hebergements') WITH ORDINALITY AS h(hebergement, ordinality)
    WHERE
      ds.statut <> 'BROUILLON'
      AND h.hebergement -> 'coordonnees' -> 'adresse' ->> 'departement' = ANY($1)
      AND (
        unaccent(h.hebergement ->> 'nom') ILIKE '%' || unaccent($2) || '%' OR
        h.hebergement -> 'coordonnees' ->> 'email' ILIKE '%' || $2 || '%' OR
        unaccent(h.hebergement -> 'coordonnees' -> 'adresse' ->> 'label') ILIKE '%' || unaccent($2) || '%'
      )
    ORDER BY "${sort}" ${order}
  ),
  total_count AS (
    SELECT COUNT(*) AS count FROM filtered_hebergements
  ),
  paged_hebergements AS (
    SELECT * FROM filtered_hebergements
    LIMIT $3 OFFSET $4
  )
  SELECT
    jsonb_build_object(
      'total_count', (SELECT count FROM total_count),
      'hebergements', jsonb_agg(ph.*)
    ) AS data
  FROM paged_hebergements AS ph;
  `,
    [departementCodes, search, limit, offset],
  ],
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
  ds.declaration_2m as "declaration2mois",
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
  getStats: (userId) => [
    `
    SELECT
      COUNT(DISTINCT CASE WHEN ds.statut = $2 THEN ds.id ELSE NULL END)::integer AS "countBrouillon",
      COUNT(DISTINCT CASE WHEN ds.statut IN ($3, $4, $5) THEN ds.id ELSE NULL END)::integer AS "countDeclarationAcompleter",
      COUNT(DISTINCT CASE WHEN ds.statut IN ($6, $7, $8, $9) THEN ds.id ELSE NULL END)::integer AS "countDeclarationEnInstruction",
      COUNT(DISTINCT CASE WHEN ds.statut = $10 THEN ds.id ELSE NULL END)::integer AS "countDeclarationFinalisee",
      COUNT(DISTINCT CASE WHEN ds.statut = $11 THEN ds.id ELSE NULL END)::integer AS "countSejourEnCours",
      COUNT(DISTINCT CASE WHEN ds.statut = $12 THEN ds.id ELSE NULL END)::integer AS "countTerminee"
    FROM front.demande_sejour ds
    JOIN front.organismes o ON ds.organisme_id = o.id
    JOIN front.user_organisme uo ON o.id = uo.org_id
    WHERE uo.use_id = $1;
    `,
    [
      userId,
      // countBrouillon
      dsStatus.statuts.BROUILLON,
      // countDeclarationAcompleter
      dsStatus.statuts.A_MODIFIER,
      dsStatus.statuts.A_MODIFIER_8J,
      dsStatus.statuts.ATTENTE_8_JOUR,
      // countDeclarationEnInstruction
      dsStatus.statuts.TRANSMISE,
      dsStatus.statuts.TRANSMISE_8J,
      dsStatus.statuts.EN_COURS,
      dsStatus.statuts.EN_COURS_8J,
      // countDeclarationFinalisee
      dsStatus.statuts.VALIDEE_8J,
      // countSejourEnCours
      dsStatus.statuts.SEJOUR_EN_COURS,
      // countTerminee
      dsStatus.statuts.TERMINEE,
    ],
  ],
  getStatut: `
  SELECT
    STATUT as "statut"
  FROM
    FRONT.DEMANDE_SEJOUR
  WHERE
    ID = $1
  `,
  historique: `
SELECT
  h.id as "historiqueId",
  h.source as "source",
  h.demande_sejour_id as "declarationId",
  CASE WHEN u.id IS NOT null then u.mail ELSE bu.mail || replace(replace(bu.deleted::text,'true',' (inactif)'),'false','') END as "userEmail",
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
    id as "declarationId"
    `,
  updateInformationsGenerales: (
    libelle,
    dateDebut,
    dateFin,
    duree,
    periode,
    responsableSejour,
    declarationId,
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
  id as "declarationId"
`,
    [
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      responsableSejour,
      declarationId,
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
  id as "declarationId"
`,
  updateInformationsProjetSejour: `
UPDATE front.demande_sejour ds
SET
  projet_sejour = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "declarationId"
`,
  updateInformationsSanitaires: `
UPDATE front.demande_sejour ds
SET
  sanitaires = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "declarationId"
`,
  updateInformationsTransport: `
UPDATE front.demande_sejour ds
SET
  transport = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "declarationId"
`,
  updateInformationsVacanciers: `
  UPDATE front.demande_sejour ds
  SET
    vacanciers = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "declarationId"
  `,
  updateOrganisme: `
  UPDATE front.demande_sejour ds
  SET
    organisme_id = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "declarationId"
  `,
  updateProjetSejour: `
  UPDATE front.demande_sejour ds
  SET
    projet_sejour = $1,
    edited_at = NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "declarationId"
  `,
  updateStatut: `
UPDATE front.demande_sejour ds
SET
  statut = $1,
  edited_at = NOW()
WHERE
  ds.id = $2
RETURNING
  id as "declarationId"
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
  const { declarationId } = response.rows[0];
  log.i("create - DONE", { declarationId });
  return declarationId;
};

module.exports.copy = async (declaration) => {
  log.i("copy - IN");
  const response = await pool.query(
    ...query.copy(
      declaration.organismeId,
      `COPIE - ${declaration.libelle}`,
      declaration.dateDebut,
      declaration.dateFin,
      declaration.duree,
      declaration.periode,
      declaration.responsableSejour,
      declaration.organisme,
      declaration.hebergement,
      declaration.informationsVacanciers,
      declaration.informationsPersonnel,
      declaration.informationsTransport,
      declaration.projetSejour,
      declaration.informationsSanitaires,
      declaration.files,
    ),
  );
  log.d(response);
  const { declarationId } = response.rows[0];
  log.i("copy - DONE", { declarationId });
  return declarationId;
};

module.exports.delete = async (declarationId, userId) => {
  log.i("delete - IN");
  const { rowCount } = await pool.query(...query.delete(declarationId, userId));
  log.i("delete - DONE");
  return rowCount;
};
module.exports.cancel = async (declarationId, userId) => {
  log.i("cancel - IN");
  const { rowCount } = await pool.query(...query.cancel(declarationId, userId));
  log.i("cancel - DONE");
  return rowCount;
};
module.exports.get = async ({ sortBy }, organismesId) => {
  log.i("get - IN", { organismesId });
  const queryGet = query.get(organismesId);
  let querySorted = "";
  if (sortBy) {
    if (sortBy === "messageOrdreEtat")
      querySorted += ` ORDER BY "messageOrdreEtat" ASC, "messageCreatedAt" ASC`;
    else querySorted += ` ORDER BY "${sortBy}" ASC`;
  } else {
    querySorted += " ORDER BY ds.edited_at DESC";
  }
  const finalQuery = queryGet[0] + querySorted;
  const queryParams = queryGet[1];
  const response = await pool.query(finalQuery, [queryParams[0]]);
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
      stats: {
        declaration8J: 0,
        enCours: 0,
        enCours8J: 0,
        global: 0,
        nonFinalisees: 0,
        terminee: 0,
        transmis: 0,
        transmis8J: 0,
        validee8J: 0,
      },
      total: 0,
    };
  }

  log.i("getByDepartementCodes - IN");

  const params = [];
  const searchQuery = [];

  // Search management
  if (search?.idFonctionnelle && search.idFonctionnelle.length) {
    searchQuery.push(`id_fonctionnelle ILIKE $${params.length + 1}`);
    params.push(`%${search.idFonctionnelle}%`);
  }
  if (search?.libelle && search.libelle.length) {
    searchQuery.push(`libelle ILIKE unaccent($${params.length + 1})`);
    params.push(`%${search.libelle}%`);
  }
  if (search?.organisme && search.organisme.length) {
    searchQuery.push(`(
      personne_morale ->> 'raisonSociale' ILIKE $${params.length + 1}
      OR unaccent(personne_physique ->> 'prenom') ILIKE unaccent($${params.length + 2})
      OR unaccent(personne_physique ->> 'nomUsage') ILIKE unaccent($${params.length + 3})
      )`);
    params.push(
      `%${search.organisme}%`,
      `%${search.organisme}%`,
      `%${search.organisme}%`,
    );
  }
  if (search?.statuts && search.statuts.length) {
    searchQuery.push(`statut = ANY($${params.length + 1})`);
    params.push(search.statuts.split(","));
  }

  if (search?.action) {
    searchQuery.push(
      `statut in ('${dsStatus.statuts.EN_COURS}', '${dsStatus.statuts.EN_COURS_8J}', '${dsStatus.statuts.TRANSMISE}', '${dsStatus.statuts.TRANSMISE_8J}')`,
    );
  }
  if (search?.message) {
    searchQuery.push(`dsm.message is not null`);
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
  const stats = await pool.query(
    ...query.getAdminStats(departementCodes, territoireCode),
  );

  // Order management
  if (sortBy && sortDirection) {
    if (sortBy === "messageOrdreEtat")
      queryWithPagination += ` ORDER BY "${sortBy}" ${sortDirection}, "messageCreatedAt" DESC`;
    else
      queryWithPagination += `ORDER BY "${sortBy}" ${sortDirection}, ds.edited_at DESC`;
  } else {
    queryWithPagination += "ORDER BY ds.edited_at DESC";
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
      stats: Object.entries(stats.rows[0]).reduce((acc, [key, value]) => {
        acc[key] = Number(value);
        return acc;
      }, {}),
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
  const totalValue = total.rows.find((t) => t.count)?.count;
  return {
    demandes_sejour: response.rows,
    stats: Object.entries(stats.rows[0]).reduce((acc, [key, value]) => {
      acc[key] = Number(value);
      return acc;
    }, {}),
    total: totalValue ? parseInt(totalValue) : 0,
  };
};

module.exports.getById = async (declarationId, departements) => {
  log.i("getById - IN", { declarationId });

  const { rows: declarations } = await pool.query(
    ...query.getById(declarationId, departements),
  );
  log.d(declarations);

  log.i("getById - DONE");
  return declarations[0];
};

module.exports.getHebergement = async (
  demandeSejourId,
  departementCodes,
  hebergementId,
) => {
  log.i("getHebergement - IN");
  const { rows } = await pool.query(
    ...query.getHebergement(demandeSejourId, departementCodes, hebergementId),
  );
  log.d("getHebergement - DONE");
  return rows;
};

module.exports.getHebergementsByDepartementCodes = async (
  departementsCodes,
  params,
) => {
  log.i("getHebergementsByDepartementCodes - IN");
  const { rows } = await pool.query(
    ...query.getHebergementsByDepartementCodes(departementsCodes, params),
  );
  log.d("getHebergementsByDepartementCodes - DONE");
  return rows[0];
};

module.exports.getAdminStats = async (departements, territoireCode) => {
  log.i("getAdminStats - IN");

  const {
    rows: [stats],
  } = await pool.query(...query.getAdminStats(departements, territoireCode));
  log.i("getAdminStats - DONE");
  return stats;
};

module.exports.getStats = async (userId) => {
  log.i("getStatts - IN");
  const {
    rows: [stats],
  } = await pool.query(...query.getStats(userId));
  log.i("getStatts - DONE");
  return stats;
};

module.exports.getStatut = async (declarationId) => {
  log.i("getStatut - IN");
  const { rows: data } = await pool.query(query.getStatut, [declarationId]);
  log.d(data);
  log.i("getStatut - DONE");
  return data[0].statut ?? null;
};

module.exports.update = async (type, declarationId, parametre) => {
  log.i("update - IN", { declarationId, parametre, type });
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
          declarationId,
        ),
      );
      break;
    }
    case "informationsVacanciers": {
      log.d("informationsVacanciers", declarationId);
      response = await pool.query(query.updateInformationsVacanciers, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "informationsPersonnel": {
      log.d("informationsPersonnel", declarationId);
      response = await pool.query(query.updateInformationsPersonnel, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "projetSejour": {
      log.d("projetSejour", declarationId);
      response = await pool.query(query.updateProjetSejour, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "protocole_transport": {
      log.d("protocole_transport", declarationId);
      response = await pool.query(query.updateInformationsTransport, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      log.d("protocole_sanitaire", declarationId);
      response = await pool.query(query.updateInformationsSanitaires, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "hebergements": {
      log.d("hebergements", declarationId);
      response = await pool.query(query.updateHebergement, [
        parametre,
        declarationId,
      ]);
      break;
    }
    default:
      log.d("wrong type");
      return null;
  }
  log.i("update - DONE");
  const updatedDeclarationId = response.rows[0].declarationId ?? null;
  return updatedDeclarationId;
};

module.exports.finalize8jours = async (
  declarationId,
  { informationsVacanciers, informationsPersonnel, hebergement, attestation },
) => {
  log.i("finalize - IN", {
    declaration: {
      attestation,
      hebergement,
      informationsPersonnel,
      informationsVacanciers,
    },
    declarationId,
  });

  await pool.query(
    ...query.finalize8jours(
      declarationId,
      informationsVacanciers,
      informationsPersonnel,
      hebergement,
      attestation,
    ),
  );
  log.i("finalize - DONE");
};

module.exports.finalize = async (
  declarationId,
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
    declarationId,
    departementSuivi,
    idFonctionnelle,
  });

  await pool.query(
    ...query.finalize(
      declarationId,
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

module.exports.getExtract = async (territoireCode, departementCodes) => {
  log.i("getExtract - IN");

  const departementQuery = getDepartementWhereQuery(departementCodes, [
    departementCodes,
  ]);

  const { rows: data } = await pool.query(
    query.getExtract(departementQuery, territoireCode),
    [departementCodes],
  );
  log.i("getExtract - DONE");
  return data;
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
  declarationId,
  statut,
  event = null,
  cb = null,
) => {
  log.i("updateStatut - IN", { declarationId, statut });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const response = await client.query(query.updateStatut, [
      statut,
      declarationId,
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
    const updatedDeclarationId = response.rows[0].declarationId ?? null;
    log.i("updateStatut - DONE");

    return updatedDeclarationId;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
