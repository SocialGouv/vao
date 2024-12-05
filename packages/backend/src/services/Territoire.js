const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  getFicheIdByTerCode: `
  select
        fte.id AS id
      FROM back.fiche_territoire fte
      WHERE ter_code = $1`,
  getOne: `
    select
        fte.id AS territoire_id,
        CASE (ter.code ~ '[0-9]')
        	WHEN true THEN 'DEP'
 			    ELSE 'REG'
        END AS type,
        ter.code AS value,
        ter.label AS text,
        ter.parent_code AS parent,
        fte.service_mail AS service_mail,
        fte.service_telephone AS service_telephone, 
        fte.corresp_vao_nom AS corresp_vao_nom,
        fte.corresp_vao_prenom AS corresp_vao_prenom,
        fte.edited_at AS edited_at
      FROM back.fiche_territoire fte
      INNER JOIN geo.territoires ter ON fte.ter_code = ter.code
      WHERE fte.id = $1`,
  select: (search) => {
    return `
      select
        fte.id AS territoire_id,
        CASE (ter.code ~ '[0-9]')
        	WHEN true THEN 'DEP'
 			    ELSE 'REG'
        END AS type,
        ter.code AS value,
        ter.label AS text,
        fte.service_telephone AS service_telephone, 
        fte.corresp_vao_nom AS corresp_vao_nom,
        fte.corresp_vao_prenom AS corresp_vao_prenom,
        fte.service_mail as service_mail,
        COUNT(distinct(usr.id)) as nbusersbo
      FROM geo.territoires ter
      INNER JOIN back.fiche_territoire fte ON fte.ter_code = ter.code
      LEFT JOIN back.users usr ON usr.ter_code = ter.code
      WHERE ter.code <> 'FRA'
      ${search.map((s) => ` AND ${s} `).join("")}
      GROUP BY territoire_id,type,value,text,service_telephone,corresp_vao_nom,corresp_vao_prenom,service_mail
      `;
  },
  selectTotal: (search) => {
    return `
      select
        count(distinct(fte.id )) AS count
      FROM geo.territoires ter
      INNER JOIN back.fiche_territoire fte ON fte.ter_code = ter.code
      WHERE ter.code <> 'FRA'
      ${search.map((s) => ` AND ${s} `).join("")}
      `;
  },
  update: `
      UPDATE back.fiche_territoire
      SET
        corresp_vao_nom = $2,
        corresp_vao_prenom = $3,
        service_mail = $4,
        service_telephone = $5, 
        edited_at = NOW()
      WHERE
        id = $1
      RETURNING *
      `,
};

module.exports.fetch = async ({
  limit,
  offset,
  sortBy = "text",
  sortDirection = "ASC",
  search,
} = {}) => {
  log.i("fetch - IN");
  const searchQuery = [];
  const params = [];

  if (search?.text && search.text.length) {
    searchQuery.push(
      `unaccent(ter.label) ILIKE unaccent($${params.length + 1})`,
    );
    params.push(`%${search.text}%`);
  }
  let queryWithPagination = query.select(searchQuery);

  // Order management
  if (sortBy && sortDirection) {
    queryWithPagination += `ORDER BY "${sortBy}" ${sortDirection}`;
  } else {
    queryWithPagination += `ORDER BY type, text ASC`;
  }
  const total = await pool.query(query.selectTotal(searchQuery), params);

  const paramsWithPagination = [...params];
  // Pagination management
  if (limit != null && offset != null) {
    queryWithPagination += `
    OFFSET $${params.length + 1}
    LIMIT $${params.length + 2}
    `;
    paramsWithPagination.push(offset, limit);
  }

  const territoires = await pool.query(
    queryWithPagination,
    paramsWithPagination,
  );
  return { territoires: territoires.rows, total: total.rows[0].count };
};

module.exports.readFicheIdByTerCode = async (territoireCode) => {
  log.i("readFicheIdByTerCode - IN");
  const { rows } = await pool.query(query.getFicheIdByTerCode, [
    territoireCode,
  ]);
  log.i("readFicheIdByTerCode - DONE");
  return rows[0];
};

module.exports.readOne = async (idTerritoire) => {
  log.i("fetch - IN");
  const { rows } = await pool.query(query.getOne, [idTerritoire]);
  log.i("fetch - DONE");
  return rows[0];
};

module.exports.update = async (id, { nom, prenom, email, telephone }) => {
  log.i("update - IN", { id });

  const response = await pool.query(query.update, [
    id,
    nom,
    prenom,
    email,
    telephone,
  ]);

  if (response.rows.Count === 0) {
    log.d("update - DONE - fiche territoire inexistante");
    throw new AppError("Fiche territoire déjà inexistant", {
      name: "FicheTerritoireNotFound",
    });
  }

  log.i("update - DONE");
  return { territoire: response.rows[0] };
};
