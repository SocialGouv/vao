const {
  DemandeSejourRepository,
} = require("../repositories/usagers/DemandeSejour");

const Sentry = require("@sentry/node");
const { sentry } = require("../config");
const dayjs = require("dayjs");
const logger = require("../utils/logger");
const { getPool } = require("../utils/pgpool");
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const PersonneMorale = require("./organisme/PersonneMorale");
const PersonnePhysique = require("./organisme/PersonnePhysique");
const { entities, userTypes } = require("../helpers/tracking");
const { addHistoric } = require("./Tracking");
const { getComplementOrganisme } = require("./Organisme");
const {
  getByDSId: getHebergementsByDSIds,
} = require("./hebergement/Hebergement");
const { processQuery } = require("../helpers/queryParams");
const { mapQueryParams } = require("./demandeSejour/queryUtils");

const log = logger(module.filename);

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
    sejourEtranger,
    sejourItinerant,
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
      files,
      sejour_etranger,
      sejour_itinerant
    )
    VALUES ('BROUILLON',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
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
      sejourEtranger,
      sejourItinerant,
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
  get: () =>
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
  pm.siret as "siret",
  JSON_BUILD_OBJECT(
          'siret', pm.etab_principal_siret,
          'adresse', pm.etab_principal_adresse,
          'telephone', pm.etab_principal_telephone,
          'nomCommercial', pm.etab_principal_nom_commercial,
          'raisonSociale', pm.etab_principal_raison_sociale,
          'pays', pm.etab_principal_pays,
          'email', pm.etab_principal_email
      ) AS "organismeAgree",
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
LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
      SELECT MAX(dsmax.id)
      FROM front.demande_sejour_message  dsmax
      WHERE dsmax.declaration_id = ds.id)
WHERE
  o.id = ANY ($1)
`,
  getByDepartementCodes: (search, territoireCode) => {
    return `
SELECT
  ds.id as "declarationId",
  ds.created_at as "createdAt",
  ds.edited_at as "editedAt",
  ds.statut as "statut",
  ds.organisme_id as "organismeId",
  ds.libelle as "libelle",
  ds.date_debut::text as "dateDebut",
  ds.date_fin::text as "dateFin",
  ds.organisme as "organisme",
  ds.id_fonctionnelle as "idFonctionnelle",
  o.type_organisme as "typeOrganisme",
  (
    SELECT
      DEPARTEMENT = ANY ($1)
    FROM
      FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
      LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
      LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
    WHERE DSTH.DEMANDE_SEJOUR_ID = DS.ID
    ORDER BY DSTH.DATE_DEBUT
    LIMIT 1
  ) as "estInstructeurPrincipal",
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
  LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
  LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
  LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
  LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
      SELECT MAX(dsmax.id)
      FROM front.demande_sejour_message  dsmax
      WHERE dsmax.declaration_id = ds.id)
WHERE
  ds.statut <> 'BROUILLON'
  AND (
      EXISTS (
    SELECT
      1
    FROM
      FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
      LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
      LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
    WHERE
      DSTH.DEMANDE_SEJOUR_ID = DS.ID
      AND A.DEPARTEMENT = ANY ($1)
  )
  OR
    a.region_obtention = '${territoireCode}')
  ${search.map((s) => ` AND ${s} `).join("")}
`;
  },
  getByDepartementCodesTotal: (search, territoireCode) => {
    return `
SELECT COUNT(DISTINCT ds.id)
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
LEFT JOIN front.personne_morale pm ON pm.organisme_id  = ds.organisme_id
LEFT JOIN front.personne_physique pp ON pp.organisme_id  = ds.organisme_id
LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id
WHERE
  ds.statut <> 'BROUILLON'
  AND (
    EXISTS (
      SELECT
        1
      FROM
        FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
        LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
        LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
      WHERE
        DSTH.DEMANDE_SEJOUR_ID = DS.ID
        AND A.DEPARTEMENT = ANY ($1)
    )
  OR
    a.region_obtention = '${territoireCode}')
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
      sejour_etranger as "sejourEtranger",
      sejour_itinerant as "sejourItinerant",
      ds.organisme as "organisme",
      o.type_organisme as "typeOrganisme",
      ds.files as "files",
      ds.departement_suivi = ANY($2) as "estInstructeurPrincipal",
      ds.created_at as "createdAt",
      ds.edited_at as "editedAt"
    FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
      LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
      LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
    where ds.id = $1`,
      [declarationId, departements],
    ];
  },
  getByIdOrUserSiren: `
    SELECT distinct(ds.id)
    FROM
    front.demande_sejour ds
    JOIN front.user_organisme uo ON uo.org_id = ds.organisme_id
    JOIN front.users u ON uo.use_id = u.id
    JOIN front.organismes o ON o.id = ds.organisme_id
    LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
    WHERE ds.id = $1
    AND (u.id = $3 OR pm.siren = $2)
  `,
  getDeclarationsMessages: () => `
    WITH demande_avec_message AS (
      SELECT
        ds.id as "declarationId",
        ds.statut as "statut",
        ds.id_fonctionnelle as "idFonctionnelle",
        ds.organisme_id as "organismeId",
        ds.libelle as "libelle",
        ds.date_debut::text as "dateDebut",
        ds.date_fin::text as "dateFin",
        ds.created_at as "createdAt",
        ds.edited_at as "editedAt",
        ds.organisme as "organisme",
        CASE
          WHEN o.type_organisme = 'personne_morale' THEN
            JSON_BUILD_OBJECT(
              'siret', pm.siret,
              'adresse', pm.adresse,
              'telephone', pm.telephone,
              'nomCommercial', pm.etab_principal_nom_commercial,
              'raisonSociale', pm.raison_sociale,
              'pays', pm.pays,
              'email', pm.email
            )
          ELSE
            JSON_BUILD_OBJECT(
              'adresse', pp.adresse_siege_label,
              'nom', pp.nom_usage,
              'prenom', pp.prenom,
              'nomNaissance', pp.nom_naissance,
              'telephone', pp.telephone,
              'profession', pp.profession
            )
        END AS "organismeAgree",
        o.type_organisme as "typeOrganisme",

        (
          SELECT
            A.departement = ANY ($1)
          FROM
            FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
            LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
            LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
          WHERE DSTH.DEMANDE_SEJOUR_ID = DS.ID
          ORDER BY DSTH.DATE_DEBUT
          LIMIT 1
        ) as "estInstructeurPrincipal",
        dsm.message as "message",
        CASE
          WHEN (dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 'NON LU'
          WHEN (dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 'LU'
          WHEN (dsm.front_user_id IS NULL) THEN 'REPONDU'
        END AS "messageEtat",
        CASE
          WHEN (dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 1
          WHEN (dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 2
          WHEN (dsm.front_user_id IS NULL) THEN 3
        END AS "messageOrdreEtat",
        dsm.read_at AS "messageReadAt",
        dsm.created_at AS "messageCreatedAt",
        COALESCE(dsm.read_at, dsm.created_at) AS "messageLastAt"
      FROM front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
      LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
      LEFT JOIN front.agrements a ON a.organisme_id = ds.organisme_id
      LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
          SELECT MAX(dsmax.id)
          FROM front.demande_sejour_message dsmax
          WHERE dsmax.declaration_id = ds.id
        )
      WHERE
        ds.statut <> 'BROUILLON'
        AND dsm.message IS NOT NULL
        AND (
          EXISTS (
            SELECT 1
            FROM FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
            LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
            LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
            WHERE DSTH.DEMANDE_SEJOUR_ID = DS.ID
              AND A.DEPARTEMENT = ANY ($1)
          )
          OR a.region_obtention = $2
        )
    )
    SELECT *
    FROM demande_avec_message
    WHERE 1 = 1
  `,
  getDeprecated: (organismeIds) => [
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
  COALESCE(ds.projet_sejour, '{}'::jsonb) as "projetSejour",
  ds.sanitaires as "sanitaires",
  ds.files as "files",
  ds.attestation as "attestation",
  pm.siret as "siret",
  JSON_BUILD_OBJECT(
          'siret', pm.etab_principal_siret,
          'adresse', pm.etab_principal_adresse,
          'telephone', pm.etab_principal_telephone,
          'nomCommercial', pm.etab_principal_nom_commercial,
          'raisonSociale', pm.etab_principal_raison_sociale,
          'pays', pm.etab_principal_pays,
          'email', pm.etab_principal_email
      ) AS "organismeAgree",
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
LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
      SELECT MAX(dsmax.id)
      FROM front.demande_sejour_message  dsmax
      WHERE dsmax.declaration_id = ds.id)
WHERE
  o.id = ANY ($1)
`,
    [organismeIds],
  ],
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
    WHERE u.ter_code = $1 AND u.deleted = false
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
    WHERE (u.ter_code = ANY($1)
      OR u.ter_code = ANY(r.parent_code))
      AND u.deleted = FALSE
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
LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
WHERE
  pm.siren = $1 AND
  pm.siege_social = 'true'
  AND u.status_code = 'VALIDATED'
`,
  getEmailToList: `
SELECT DISTINCT u.mail AS mail
FROM front.users u
JOIN front.user_organisme uo
  ON u.id = uo.use_id
WHERE uo.org_id = $1 AND u.status_code = 'VALIDATED'
`,
  getExtract: (territoireCode) => `
  SELECT
    ds.id AS id,
    ds.libelle AS libelle,
    ds.date_debut::text AS date_debut,
    ds.date_fin::text AS date_fin,
    ds.organisme AS organisme,
    ds.responsable_sejour->>'email' AS responsable_sejour_email,
    ds.responsable_sejour->>'telephone' AS responsable_sejour_telephone,
    ds.id_fonctionnelle AS reference,
    ds.statut AS statut,
    ds.created_at AS created_at,
    (
      SELECT adr.departement
      FROM FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT dsth
      LEFT JOIN FRONT.HEBERGEMENT h ON h.id = dsth.hebergement_id
      LEFT JOIN front.adresse adr ON adr.id = h.adresse_id
      WHERE dsth.demande_sejour_id = ds.id
      ORDER BY dsth.date_debut ASC
      LIMIT 1
    ) AS departement_instruction,
    (
      SELECT reg.code
      FROM FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT dsth
      LEFT JOIN FRONT.HEBERGEMENT h ON h.id = dsth.hebergement_id
      LEFT JOIN front.adresse adr ON adr.id = h.adresse_id
      LEFT JOIN geo.territoires dep ON dep.code = adr.departement
      LEFT JOIN geo.territoires reg ON dep.parent_code = reg.code
      WHERE dsth.demande_sejour_id = ds.id
      ORDER BY dsth.date_debut ASC
      LIMIT 1
    ) AS region_instruction
  FROM front.demande_sejour ds
  JOIN front.organismes o ON o.id = ds.organisme_id
  LEFT JOIN front.agrements a ON a.organisme_id = ds.organisme_id
  WHERE (
      EXISTS (
        SELECT
          1
        FROM FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT dsth
        LEFT JOIN FRONT.HEBERGEMENT h ON h.id = dsth.hebergement_id
        LEFT JOIN FRONT.ADRESSE a ON a.id = h.adresse_id
        WHERE dsth.demande_sejour_id = ds.id
        AND a.departement = ANY ($1)
      )
  AND statut <> 'BROUILLON'
  OR a.region_obtention = '${territoireCode}')`,
  getExtractFO: `SELECT
      ds.id as "declarationId",
      ds.statut as "statut",
      ds.id_fonctionnelle as "reference",
      o.type_organisme as "type_organisme",
      ds.libelle as "libelle",
      ds.date_debut::text as "date_debut",
      ds.date_fin::text as "date_fin",
      pm.raison_sociale as "raison_sociale",
      COALESCE(STRING_AGG(DISTINCT COALESCE(pm.siret, pp.siret), ', '),'') AS siret,
      (
          SELECT adr.departement
          FROM front.demande_sejour_to_hebergement dsth
          LEFT JOIN front.hebergement h ON h.id = dsth.hebergement_id
          LEFT JOIN front.adresse adr ON adr.id = h.adresse_id
          WHERE dsth.demande_sejour_id = ds.id
          ORDER BY dsth.date_debut ASC
          LIMIT 1
        ) AS departement,
      (
        SELECT h.nom
        FROM front.demande_sejour_to_hebergement dsth
        LEFT JOIN front.hebergement h ON h.id = dsth.hebergement_id
        LEFT JOIN front.adresse adr ON adr.id = h.adresse_id
        WHERE dsth.demande_sejour_id = ds.id
        ORDER BY dsth.date_debut ASC
        LIMIT 1
      ) AS hebergement_nom
    FROM front.demande_sejour ds
    JOIN front.organismes o ON o.id = ds.organisme_id
    LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
    LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
    WHERE
      o.id = ANY ($1)
    GROUP BY ds.id,
      ds.statut,
      ds.id_fonctionnelle,
      o.type_organisme ,
      ds.libelle ,
      ds.date_debut,
      ds.date_fin,
      pm.raison_sociale
    ORDER BY date_debut
    `,
  getHebergementsByDepartementCodes: () => `
    SELECT
      DS.ID AS "declarationId",
      H.ID AS "hebergementId",
      DS.DATE_DEBUT AS "dateSejour",
      DS.DEPARTEMENT_SUIVI AS "departement",
      H.NOM AS "nom",
      DSTH.DATE_DEBUT AS "dateDebut",
      DSTH.DATE_FIN AS "dateFin",
      H.EMAIL AS EMAIL,
      H.TELEPHONE_1 AS TELEPHONE,
      H.NOM_GESTIONNAIRE AS "nomGestionnaire",
      A.LABEL AS ADRESSE,
      (SELECT VALUE FROM FRONT.HEBERGEMENT_TYPE WHERE ID = H.ID) AS "typeHebergement",
      H.VISITE_LOCAUX_AT AS "dateVisite",
      H.REGLEMENTATION_ERP AS "reglementationErp"
    FROM
      FRONT.HEBERGEMENT H
      LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
      INNER JOIN FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH ON DSTH.HEBERGEMENT_ID = H.ID
      INNER JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = DSTH.DEMANDE_SEJOUR_ID
    WHERE
      DS.STATUT <> 'BROUILLON'
      AND A.DEPARTEMENT = ANY($1)
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
  ds.organisme as "organisme",
  ds.files as "files",
  ds.attestation as "attestation",
  ds.declaration_2m as "declaration2mois",
  pm.siret as "siret",
  ds.edited_at as "editedAt",
  sejour_etranger as "sejourEtranger",
  sejour_itinerant as "sejourItinerant"
FROM front.demande_sejour ds
JOIN front.organismes o ON o.id = ds.organisme_id
LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
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
      userId, // countBrouillon
      DEMANDE_SEJOUR_STATUTS.BROUILLON, // countDeclarationAcompleter
      DEMANDE_SEJOUR_STATUTS.A_MODIFIER,
      DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J,
      DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR, // countDeclarationEnInstruction
      DEMANDE_SEJOUR_STATUTS.TRANSMISE,
      DEMANDE_SEJOUR_STATUTS.TRANSMISE_8J,
      DEMANDE_SEJOUR_STATUTS.EN_COURS,
      DEMANDE_SEJOUR_STATUTS.EN_COURS_8J, // countDeclarationFinalisee
      DEMANDE_SEJOUR_STATUTS.VALIDEE_8J, // countSejourEnCours
      DEMANDE_SEJOUR_STATUTS.SEJOUR_EN_COURS, // countTerminee
      DEMANDE_SEJOUR_STATUTS.TERMINEE,
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
  ` /*
   * La query peut insérer plusieurs hébergements d'un coup, d'ùou la necessité de generer plusieurs lignes via le .map
   * de la requete. Par exemple, si l'on veut inserer 2 hebergements, on utilisera la syntaxe
   * linkToHebergements(2) avec comme params le tableau (flat)
   * [demande_sejour_id, HEBERGEMENT_ID_1, DATE_DEBUT_1, DATE_FIN_1, HEBERGEMENT_ID_2, DATE_DEBUT_2, DATE_FIN_2]
   *
   * Le .map genere le texte suivant :
   * ($1, $2, $3, $4), ($1, $5, $6, $7)
   * */,
  linkToHebergements: (nbRows) => `
INSERT INTO
  FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT (
    DEMANDE_SEJOUR_ID,
    HEBERGEMENT_ID,
    DATE_DEBUT,
    DATE_FIN
  )
VALUES
${new Array(nbRows)
  .fill(null)
  .map(
    (_, index) =>
      `($1, $${3 * index + 2}, $${3 * index + 3}, $${3 * index + 4})`,
  )
  .join(",")}
  `,
  saveDS2M: `
  UPDATE front.demande_sejour
  SET declaration_2m = $2
  WHERE id = $1
  RETURNING id as "declarationId"
`,
  unlinkToHebergement: `
DELETE FROM FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT
WHERE
  DEMANDE_SEJOUR_ID = $1;
  `,
  updateHebergement: `
  UPDATE front.demande_sejour ds
  SET
    hebergement = $1,
    sejour_etranger = $2,
    sejour_itinerant = $3,
    edited_at = NOW()
  WHERE
    ds.id = $4
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

const linkToHebergements = async (client, declarationId, hebergements) => {
  await client.query(query.unlinkToHebergement, [declarationId]);
  if (hebergements.length > 0) {
    await client.query(query.linkToHebergements(hebergements.length), [
      declarationId,
      ...hebergements.flatMap((h) => [h.hebergementId, h.dateDebut, h.dateFin]),
    ]);
  }
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

  const response = await getPool().query(
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
  const client = await getPool().connect();
  let declarationId;
  try {
    await client.query("BEGIN");
    const response = await client.query(
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
        declaration.hebergement?.sejourEtranger ?? null,
        declaration.hebergement?.sejourItinerant ?? null,
      ),
    );
    log.d(response);
    declarationId = response.rows[0].declarationId;
    await linkToHebergements(
      client,
      declarationId,
      declaration.hebergement?.hebergements ?? [],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  log.i("copy - DONE", { declarationId });
  return declarationId;
};

module.exports.delete = async (declarationId, userId) => {
  log.i("delete - IN");
  await getPool().query(query.unlinkToHebergement, [declarationId]);
  const { rowCount } = await getPool().query(
    ...query.delete(declarationId, userId),
  );
  log.i("delete - DONE");
  return rowCount;
};
module.exports.cancel = async (declarationId, userId) => {
  log.i("cancel - IN");
  const { rowCount } = await getPool().query(
    ...query.cancel(declarationId, userId),
  );
  log.i("cancel - DONE");
  return rowCount;
};
module.exports.get = async (organismesId, queryParams) => {
  const titles = [
    {
      key: "ds.date_debut",
      queryKey: "dateDebut",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.date_fin",
      queryKey: "dateFin",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.departement_suivi",
      queryKey: "departementSuivi",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.edited_at",
      queryKey: "editedAt",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.id_fonctionnelle",
      queryKey: "idFonctionnelle",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.libelle",
      queryKey: "libelle",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.periode",
      queryKey: "periode",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "pm.siret",
      queryKey: "siret",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ds.statut",
      queryKey: "statut",
      sortEnabled: true,
      type: "default",
    },
  ];
  const paginatedQuery = processQuery(
    query.get,
    [organismesId],
    titles,
    queryParams,
    {
      sortBy: "ds.edited_at",
      sortDirection: "DESC",
    },
  );

  const result = await Promise.all([
    getPool().query(paginatedQuery.query, paginatedQuery.params),
    getPool().query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  return {
    rows: result[0].rows,
    total: parseInt(result[1].rows[0].total, 10),
  };
};
module.exports.getDeprecated = async ({ sortBy }, organismesId) => {
  log.i("get - IN", { organismesId });
  const queryGet = query.getDeprecated(organismesId);
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
  const response = await getPool().query(finalQuery, [queryParams[0]]);
  log.i("get - DONE");
  const demandes = response.rows;
  return demandes;
};

module.exports.getOne = async (criterias = {}) => {
  log.i("getOne - IN", { criterias });
  const { rows: declarations, rowCount } = await getPool().query(
    ...query.getOne(criterias),
  );
  if (rowCount !== 1) {
    log.w("getOne - DONE with unexpected result", { rowCount });
    return null;
  }
  const declaration = declarations[0];

  const hebergements = await getHebergementsByDSIds(declaration.id);

  log.i("getOne - DONE");
  return {
    ...declaration,
    hebergement: {
      hebergements,
      sejourEtranger: declaration.sejourEtranger ?? null,
      sejourItinerant: declaration.sejourItinerant ?? null,
    },
  };
};

module.exports.getByIdOrUserSiren = async (id, siren, userId) => {
  log.i("getByIdOrUserSiren - IN");
  const response = await getPool().query(query.getByIdOrUserSiren, [
    id,
    siren,
    userId,
  ]);
  log.d("getByIdOrUserSiren - DONE");
  return response.rows;
};

module.exports.getByDepartementCodes = async (
  queryParams,
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

  const criterias = [
    {
      key: "pm.siren",
      queryKey: "siren",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "pm.siret",
      queryKey: "siret",
      sortEnabled: true,
      type: "default",
    },
    {
      key: '"dateDebut"',
      queryKey: "dateDebut",
      sortEnabled: true,
      sortType: "date",
    },
    {
      key: "o.id",
      queryKey: "organismeId",
      sortEnabled: true,
      type: "number",
    },
    {
      key: "id_fonctionnelle",
      queryKey: "idFonctionnelle",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "libelle",
      queryKey: "libelle",
      sortEnabled: true,
      type: "default",
    },
    {
      query: (index, value) => {
        return {
          query: `(
            pm.raison_sociale ILIKE '%' || $${index} || '%'
            OR unaccent(pp.prenom) ILIKE '%' || unaccent($${index}) || '%'
            OR unaccent(pp.nom_usage) ILIKE '%' || unaccent($${index}) || '%'
            )`,
          queryParams: [value],
        };
      },
      queryKey: "organisme",
      sortEnabled: true,
      sortQuery: "pm.raison_sociale, pp.prenom, pp.nom_usage",
      type: "custom",
    },
    {
      query: (index, value) => {
        return {
          query: `ds.statut = ANY($${index})`,
          queryParams: [value],
        };
      },
      queryKey: "statuts",
      sortEnabled: true,
      type: "custom",
    },
    {
      query: (
        index,
        value = [
          DEMANDE_SEJOUR_STATUTS.EN_COURS,
          DEMANDE_SEJOUR_STATUTS.EN_COURS_8J,
          DEMANDE_SEJOUR_STATUTS.TRANSMISE,
          DEMANDE_SEJOUR_STATUTS.TRANSMISE_8J,
        ],
      ) => {
        return {
          query: `ds.statut IN ($${index}, $${index + 1}, $${index + 2}, $${index + 3})`,
          queryParams: [value],
        };
      },
      queryKey: "action",
      sortEnabled: true,
      type: "custom",
    },
    {
      key: "ds.statut",
      queryKey: "statut",
      sortEnabled: true,
    },
    {
      customSort: (sortBy, sortDirection) => {
        return `ORDER BY "messageOrdreEtat" ${sortDirection}, "messageCreatedAt" DESC`;
      },
      key: "messageOrdreEtat",
      queryKey: "messageEtat",
      sortEnabled: true,
    },
  ];

  const { result, count } = await DemandeSejourRepository.getByDepartementCodes(
    {
      criterias,
      departementCodes,
      queryParams: mapQueryParams(queryParams),
      territoireCode,
    },
  );
  const responseWithComplements = await Promise.all(
    result.map((demandeSejour) => getComplementOrganisme(demandeSejour)),
  );
  const { result: stats } = await DemandeSejourRepository.getAdminStats({
    departementCodes,
    territoireCode,
  });

  if (
    queryParams.limit === null ||
    responseWithComplements.length < queryParams.limit
  ) {
    return {
      demandes_sejour: responseWithComplements,
      stats,
      total: responseWithComplements.length + parseInt(queryParams.offset ?? 0),
    };
  }

  return {
    demandes_sejour: responseWithComplements,
    stats,
    total: count,
  };
};

module.exports.getDeclarationsMessages = async (
  queryParams,
  departementsCodes,
  territoireCode,
) => {
  const titles = [
    {
      key: '"idFonctionnelle"',
      queryKey: "idFonctionnelle",
      sortEnabled: true,
      type: "default",
    },
    {
      key: '"libelle"',
      queryKey: "libelle",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "statut",
      queryKey: "statut",
      sortEnabled: true,
      type: "default",
    },
    {
      key: '"organisme"',
      queryKey: "organisme",
      sortEnabled: true,
      type: "default",
    },
    {
      key: '"dateDebut"',
      queryKey: "dateDebut",
      sortEnabled: true,
      sortType: "date",
      type: "default",
    },
    {
      key: '"dateFin"',
      queryKey: "dateFin",
      sortEnabled: true,
      sortType: "date",
      type: "default",
    },
    {
      key: '"message"',
      queryKey: "message",
      sortEnabled: true,
      type: "default",
    },
    {
      customSort: (sortBy, sortDirection) => {
        return `ORDER BY "messageOrdreEtat" ${sortDirection}, "messageCreatedAt" DESC`;
      },
      key: "messageOrdreEtat",
      queryKey: "messageEtat",
      sortEnabled: true,
    },
  ];
  const paginatedQuery = processQuery(
    query.getDeclarationsMessages,
    [departementsCodes, territoireCode],
    titles,
    queryParams,
  );

  log.d(queryParams);
  log.d({ params: paginatedQuery.params, query: paginatedQuery.query });
  const result = await Promise.all([
    getPool().query(paginatedQuery.query, paginatedQuery.params),
    getPool().query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  return {
    rows: result[0].rows,
    total: parseInt(result[1].rows[0].total, 10),
  };
};

module.exports.getById = async (declarationId, departements) => {
  log.i("getById - IN", { declarationId });

  const declaration =
    (await getPool().query(...query.getById(declarationId, departements)))
      .rows?.[0] ?? null;
  const hebergements = await getHebergementsByDSIds(declarationId);
  if (!declaration) {
    return null;
  }
  const personneMorale = await PersonneMorale.getByOrganismeId(
    declaration.organismeId,
  );
  const personnePhysique = await PersonnePhysique.getByOrganismeId(
    declaration.organismeId,
  );

  log.i("getById - DONE");
  return {
    ...declaration,
    hebergement: {
      hebergements,
      sejourEtranger: declaration.sejourEtranger ?? null,
      sejourItinerant: declaration.sejourItinerant ?? null,
    },
    personneMorale: personneMorale,
    personnePhysique: personnePhysique,
  };
};

module.exports.getHebergementsByDepartementCode = async (
  queryParams,
  departementsCodes,
) => {
  const titles = [
    {
      key: "h.nom",
      queryKey: "nom",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "a.departement",
      queryKey: "departement",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "a.label",
      queryKey: "adresse",
      sortEnabled: true,
      type: "default",
    },
    {
      key: " h.telephone_1",
      queryKey: "telephone",
      sortEnabled: true,
      type: "default",
    },
    {
      key: " h.email",
      queryKey: "email",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "h.visite_locaux_at",
      queryKey: "dateVisite",
      sortEnabled: true,
      sortType: "date",
    },
    {
      key: "h.reglementation_erp",
      queryKey: "reglementationErp",
      sortEnabled: true,
      type: "default",
    },
    {
      query: (index, value) => {
        const query = `
          (
            unaccent(h.nom) ILIKE '%' || unaccent($${index}) || '%'
            OR h.email ILIKE '%' || $${index} || '%'
            OR unaccent(a.label) ILIKE '%' || unaccent($${index}) || '%'
          )
        `;
        return {
          query,
          queryParams: [value],
        };
      },
      queryKey: "search",
      type: "custom",
    },
  ];
  const paginatedQuery = processQuery(
    query.getHebergementsByDepartementCodes,
    [departementsCodes],
    titles,
    queryParams,
  );
  const result = await Promise.all([
    getPool().query(paginatedQuery.query, paginatedQuery.params),
    getPool().query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  return {
    rows: result[0].rows,
    total: parseInt(result[1].rows[0].total, 10),
  };
};

module.exports.getAdminStats = async ({ departementCodes, territoireCode }) => {
  log.i("getAdminStatss - IN");
  const { result } = await DemandeSejourRepository.getAdminStats({
    departementCodes,
    territoireCode,
  });
  log.i("getAdminStatss - DONE");
  return { stats: result };
};

module.exports.getStats = async (userId) => {
  log.i("getStatts - IN");
  const {
    rows: [stats],
  } = await getPool().query(...query.getStats(userId));
  log.i("getStatts - DONE");
  return stats;
};

module.exports.getStatut = async (declarationId) => {
  log.i("getStatut - IN");
  const { rows: data } = await getPool().query(query.getStatut, [
    declarationId,
  ]);
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

      response = await getPool().query(
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
      response = await getPool().query(query.updateInformationsVacanciers, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "informationsPersonnel": {
      log.d("informationsPersonnel", declarationId);
      response = await getPool().query(query.updateInformationsPersonnel, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "projetSejour": {
      log.d("projetSejour", declarationId);
      response = await getPool().query(query.updateProjetSejour, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "protocole_transport": {
      log.d("protocole_transport", declarationId);
      response = await getPool().query(query.updateInformationsTransport, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "protocole_sanitaire": {
      log.d("protocole_sanitaire", declarationId);
      response = await getPool().query(query.updateInformationsSanitaires, [
        parametre,
        declarationId,
      ]);
      break;
    }
    case "hebergements": {
      log.d("hebergements", declarationId);
      const client = await getPool().connect();
      try {
        await client.query("BEGIN");
        await linkToHebergements(client, declarationId, parametre.hebergements);
        response = await client.query(query.updateHebergement, [
          parametre,
          parametre?.sejourEtranger ?? null,
          parametre?.sejourItinerant ?? null,
          declarationId,
        ]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
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

  await getPool().query(
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

  await getPool().query(
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
  const { rows: data } = await getPool().query(query.getNextIndex);
  log.d(data[0].index);
  log.i("getNextIndex - DONE");
  return data[0].index ?? null;
};
module.exports.getEmailToList = async (organismeId) => {
  log.i("getEmailToList - IN", organismeId);
  const { rows: data } = await getPool().query(query.getEmailToList, [
    organismeId,
  ]);
  log.i("getEmailToList - DONE");
  return data.map((m) => m.mail);
};

module.exports.getEmailCcList = async (siren) => {
  log.i("getEmailCcList - IN", siren);
  const { rows: data } = await getPool().query(query.getEmailCcList, [siren]);
  log.i("getEmailCcList - DONE");
  return data.map((m) => m.mail);
};
module.exports.getEmailBack = async (departement) => {
  log.i("getEmailBack - IN", departement);
  const { rows: data } = await getPool().query(query.getEmailBack, [
    departement,
  ]);
  log.i("getEmailBack - DONE");
  return data.map((m) => m.mail);
};
module.exports.getEmailBackCc = async (departements) => {
  log.i("getEmailBackCc - IN", departements);
  const { rows: data } = await getPool().query(query.getEmailBackCc, [
    departements,
  ]);
  log.i("getEmailBackCc - DONE");
  return data.map((m) => m.mail);
};

module.exports.getExtract = async (territoireCode, departementCodes) => {
  log.i("getExtract - IN");

  const { rows: data } = await getPool().query(
    query.getExtract(territoireCode),
    [departementCodes],
  );
  log.i("getExtract - DONE");
  return data;
};

module.exports.getExtractFO = async (organismeId) => {
  log.i("getExtractFO - IN");
  const { rows: data } = await getPool().query(query.getExtractFO, [
    organismeId,
  ]);
  log.i("getExtractFO - DONE");
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
  const { rows: response } = await getPool().query(query.insertEvent, [
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
  await getPool().query(query.saveDS2M, [declarationId, declaration]);
  log.i("saveDS2M - DONE");
};

module.exports.addFile = async (declarationId, file) => {
  log.i("addFile - IN", { declarationId });
  const { rows: response } = await getPool().query(query.addFile, [
    declarationId,
    file,
  ]);
  log.i("addFile - DONE");
  return response[0].declarationId;
};

module.exports.historique = async (declarationId) => {
  log.i("historique - IN", { declarationId });
  const { rows: response } = await getPool().query(query.historique, [
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
  const client = await getPool().connect();

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

module.exports.addAsyncDeclarationSejourHistoric = async ({
  data: { oldData, newData },
  declarationId,
  userId,
  action,
  userType,
}) => {
  try {
    addHistoric({
      action,
      data: {
        after: newData,
        before: oldData,
      },
      entity: entities.demandeSejour,
      entityId: declarationId,
      userId,
      userType: userType ?? userTypes.front,
    });
  } catch (error) {
    log.w("addAsyncHistoric - DONE with error", error);
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
  }
};
