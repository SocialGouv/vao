const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  get: (searchQuery = "", additionalParamsQuery = "", params = []) => [
    `
    SELECT
      us.id AS id,
      us.mail AS email,
      us.nom AS nom,
      us.prenom AS prenom,
      us.status_code AS statut,
      us.created_at AS "dateCreation",
      org.id AS "organismeId",
      org.type_organisme AS "typeOrganisme",
      org.personne_morale->>'siret' AS siret,
      org.personne_morale->>'siren' AS siren,
      org.personne_morale->>'raisonSociale' AS "raisonSociale",
      count(ds.id) AS "nombreDeclarations"
    FROM front.users AS us
      LEFT OUTER JOIN front.user_organisme AS uo ON uo.use_id = us.id
      LEFT OUTER JOIN front.organismes AS org ON org.id = uo.org_id
      LEFT OUTER JOIN front.demande_sejour AS ds ON ds.organisme_id = org.id
    WHERE 1 = 1
    ${searchQuery}
    GROUP BY(us.id,us.mail,us.nom,us.prenom,us.status_code,org.id,org.type_organisme,siren,siret,"raisonSociale","organismeId")
    ${additionalParamsQuery}
    `,
    [...params],
  ],
  getTotal: (additionalParamsQuery, additionalParams) => [
    `
SELECT
  COUNT (DISTINCT us.id)
FROM front.users AS us
  LEFT OUTER JOIN front.user_organisme AS uo ON uo.use_id = us.id
  LEFT OUTER JOIN front.organismes AS org ON org.id = uo.org_id
  LEFT OUTER JOIN front.demande_sejour AS ds ON ds.organisme_id = org.id
WHERE 1 = 1
${additionalParamsQuery}
`,
    additionalParams,
  ],
};

module.exports.read = async ({
  limit,
  offset,
  sortBy,
  sortDirection = "ASC",
  search,
} = {}) => {
  log.i("read - IN", { search });
  let searchQuery = "";
  const searchParams = [];

  // Search management
  if (search?.nom && search.nom.length) {
    searchQuery += `   AND us.nom ilike $${searchParams.length + 1}\n`;
    searchParams.push(`%${search.nom}%`);
  }
  if (search?.prenom && search.prenom.length) {
    searchQuery += `   AND us.prenom ilike $${searchParams.length + 1}\n`;
    searchParams.push(`%${search.prenom}%`);
  }
  if (search?.email && search.email.length) {
    searchQuery += `   AND us.mail ilike $${searchParams.length + 1}\n`;
    searchParams.push(`%${normalize(search.email)}%`);
  }
  if (search?.siret && search.siret.length) {
    searchQuery += `   AND org.personne_morale->>'siret' ilike $${searchParams.length + 1}\n`;
    searchParams.push(`%${normalize(search.siret)}%`);
  }
  if (search?.organisme && search.organisme.length) {
    searchQuery += `AND (
      org.personne_morale ->> 'raisonSociale' ilike $${searchParams.length + 1}
      OR org.personne_physique ->> 'prenom' ilike $${searchParams.length + 1}
      OR org.personne_physique ->> 'nomUsage' ilike $${searchParams.length + 1}
      )`;
    searchParams.push(`%${search.organisme}%`);
  }

  let additionalQueryParts = "";
  const additionalParams = [];

  // Order management
  if (sortBy && sortDirection) {
    additionalQueryParts += `
    ORDER BY "${sortBy}" ${sortDirection}
    `;
  } else {
    additionalQueryParts += "\n ORDER BY nom, prenom";
  }

  // Pagination management
  if (limit != null && offset != null) {
    additionalQueryParts += `
    OFFSET $${searchParams.length + additionalParams.length + 1}
    LIMIT $${searchParams.length + additionalParams.length + 2}
    `;
    additionalParams.push(offset, limit);
  }

  const response = await pool.query(
    ...query.get(searchQuery, additionalQueryParts, [
      ...searchParams,
      ...additionalParams,
    ]),
  );

  const total = await pool.query(...query.getTotal(searchQuery, searchParams));

  log.i("read - DONE");
  return {
    total: total.rows[0].count,
    users: response.rows,
  };
};

module.exports.readOne = async (id) => {
  log.i("readOne - IN", { id });

  if (!id) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const { rowCount, rows: users } = await pool.query(
    ...query.get({ "us.id": id }),
  );

  if (rowCount === 0) {
    log.d("readOne - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotFound",
    });
  }

  log.i("readOne - DONE");
  return users[0];
};
