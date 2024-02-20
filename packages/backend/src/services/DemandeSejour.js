/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.demande_sejour(
      statut,
      operateur_id,
      libelle,
      date_debut,
      date_fin,
      duree,
      periode,
      transport,
      sanitaires,
      organisateurs
    )
    VALUES ('BROUILLON',$1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING
        id as "idDemande"
    ;
    `,
  get: `
    SELECT
      ds.id as "demandeSejourId",
      ds.statut as "statut",
      ds.operateur_id as "operateurId",
      ds.libelle as "libelle",
      ds.date_debut as "dateDebut",
      ds.date_fin as "dateFin",
      ds.created_at as "createdAt",
      ds.edited_at as "editedAt",
      ds.duree as "duree",
      o.personne_morale->>'siret' as "siret"
    FROM front.demande_sejour ds
    JOIN front.operateurs o ON o.id = ds.operateur_id
    JOIN front.user_operateur uo ON uo.ope_id = o.id
    WHERE
      uo.use_id = $1
    `,
  getByAdminId: `
    SELECT
      ds.id as "demandeSejourId",
      ds.statut as "statut",
      ds.operateur_id as "operateurId",
      ds.libelle as "libelle",
      ds.date_debut as "dateDebut",
      ds.date_fin as "dateFin",
      ds.created_at as "createdAt",
      ds.edited_at as "editedAt",
      ds.duree as "duree",
      ds.vacanciers as "vacanciers",
      ds.personnel as "personnel",
      ds.transport as "transport",
      ds.projet_sejour as "projet_sejour",
      ds.sanitaires as "sanitaires",
      o.personne_morale->>'siret' as "siret"
    FROM front.demande_sejour ds
      JOIN front.operateurs o ON o.id = ds.operateur_id
    `,
  getOne: (criterias) => [
    `
    SELECT
      ds.id as "id",
      ds.statut as "statut",
      ds.operateur_id as "operateurId",
      ds.id_fonctionnelle as "idFonctionnelle",
      ds.libelle as "libelle",
      ds.date_debut as "dateDebut",
      ds.date_fin as "dateFin",
      ds.duree as "duree",
      ds.vacanciers as "informationsVacanciers",
      ds.personnel as "informationsPersonnel",
      ds.projet_sejour as "informationsProjetSejour",
      ds.transport as "informationsTransport",
      ds.sanitaires as "informationsSanitaires",
      ds.hebergement as "hebergement",
      ds.organisateurs->'organisateurs' as "organisateurs",
      o.personne_morale->>'siret' as "siret"
    FROM front.demande_sejour ds
    JOIN front.operateurs o ON o.id = ds.operateur_id
    WHERE 1=1
    ${Object.keys(criterias)
      .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
      .join(" ")}
    `,
    Object.values(criterias),
  ],
  updateHebergements: `
    UPDATE front.demande_sejour ds
    SET
    hebergement = $1,
    edited_at=NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "idDemande"
    `,
  updateInformationsGenerales: `
    UPDATE front.demande_sejour ds
      SET
      libelle = $1,
      date_debut = $2,
      date_fin = $3,
      duree = $4,
      edited_at=NOW()
    WHERE
      ds.id = $5
    RETURNING
      id as "idDemande"
    `,
  updateInformationsPersonnel: `
    UPDATE front.demande_sejour ds
      SET
      personnel = $1,
      edited_at=NOW()
    WHERE
      ds.id = $2
    RETURNING
      id as "idDemande"
    `,
  updateInformationsProjetSejour: `
    UPDATE front.demande_sejour ds
    SET
    projet_sejour = $1,
    edited_at=NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "idDemande"
    `,
  updateInformationsSanitaires: `
    UPDATE front.demande_sejour ds
    SET
    sanitaires = $1,
    edited_at=NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "idDemande"
    `,
  updateInformationsTransport: `
    UPDATE front.demande_sejour ds
    SET
    transport = $1,
    edited_at=NOW()
  WHERE
    ds.id = $2
  RETURNING
    id as "idDemande"
    `,
  updateInformationsVacanciers: `
    UPDATE front.demande_sejour ds
      SET
      vacanciers = $1,
      edited_at=NOW()
    WHERE
      ds.id = $2
    RETURNING
      id as "idDemande"
    `,
  updateOperateur: `
    UPDATE front.demande_sejour ds
      SET operateur_id=$1,
          edited_at=NOW()
    WHERE
      ds.id = $2
    RETURNING
      id as "idDemande"
    `,
  updateOrganisateurs: `
    UPDATE front.demande_sejour ds
      SET
      organisateurs = $1,
      edited_at=NOW()
    WHERE
      ds.id = $2
    RETURNING
      id as "idDemande"
    `,
};

module.exports.create = async (
  operateurId,
  libelle,
  dateDebut,
  dateFin,
  duree,
  periode,
  protocoleTransport,
  protocoleSanitaire,
  organisateurs,
) => {
  log.i("create - IN");
  const response = await pool.query(query.create, [
    operateurId,
    libelle,
    dateDebut,
    dateFin,
    duree,
    periode,
    protocoleTransport,
    protocoleSanitaire,
    organisateurs,
  ]);
  log.d(response);
  const { idDemande } = response.rows[0];
  log.d("create - DONE", { idDemande });
  return idDemande;
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
  const { rows: demandes } = await pool.query(...query.getOne(criterias));
  log.d("getOne - DONE");
  log.d(demandes[0]);
  return demandes[0] ?? [];
};

module.exports.getByAdminId = async (adminId) => {
  //  TODO : create the logic (here or in the service) to get the department of the admin.
  //  For me, the list of demandes that are goven to the admin are the list of all demands of the department

  log.i("getByAdminId - IN", adminId);
  const response = await pool.query(query.getByAdminId);
  log.d("getByAdminId - DONE");
  return response.rows;
};

module.exports.update = async (type, demandeSejourId, parametre) => {
  log.i("update - IN", { demandeSejourId });
  let response;
  switch (type) {
    case "operateur": {
      const { operateurId } = parametre;
      response = await pool.query(query.updateOperateur, [
        operateurId,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsGenerales": {
      const { libelle, dateDebut, dateFin, duree } = parametre;

      response = await pool.query(query.updateInformationsGenerales, [
        libelle,
        dateDebut,
        dateFin,
        duree,
        demandeSejourId,
      ]);
      break;
    }
    case "organisateurs": {
      const { organisateurs } = parametre;
      response = await pool.query(query.updateOrganisateurs, [
        organisateurs,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsVacanciers": {
      const { informationsVacanciers } = parametre;
      response = await pool.query(query.updateInformationsVacanciers, [
        informationsVacanciers,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsPersonnel": {
      const { informationsPersonnel } = parametre;
      response = await pool.query(query.updateInformationsPersonnel, [
        informationsPersonnel,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsProjetSejour": {
      const { informationsProjetSejour } = parametre;
      log.i(informationsProjetSejour, demandeSejourId);
      response = await pool.query(query.updateInformationsProjetSejour, [
        informationsProjetSejour,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsTransport": {
      const { informationsTransport } = parametre;
      log.i(informationsTransport, demandeSejourId);
      response = await pool.query(query.updateInformationsTransport, [
        informationsTransport,
        demandeSejourId,
      ]);
      break;
    }
    case "informationsSanitaires": {
      const { informationsSanitaires } = parametre;
      log.i(informationsSanitaires, demandeSejourId);
      response = await pool.query(query.updateInformationsSanitaires, [
        informationsSanitaires,
        demandeSejourId,
      ]);
      break;
    }
    case "hebergements": {
      const { hebergements } = parametre;
      log.i(hebergements, demandeSejourId);
      response = await pool.query(query.updateHebergements, [
        hebergements,
        demandeSejourId,
      ]);
      break;
    }
    default:
      log.d("wrong type");
      return null;
  }
  log.d("update - DONE");
  const idDemande = response.rows[0].idDemande ?? null;
  return idDemande;
};
