const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);
const {
  sanitizePaginationParams,
  sanitizeFiltersParams,
  applyFilters,
  applyPagination,
} = require("../helpers/queryParams");

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
  select: () =>
    `
    SELECT
      fte.id AS "territoireId",
      CASE (ter.code ~ '[0-9]')
        WHEN true THEN 'DEP'
        ELSE 'REG'
      END AS type,
      ter.code AS code,
      ter.label AS label,
      fte.corresp_vao_prenom AS "correspVaoPrenom",
      fte.corresp_vao_nom AS "correspVaoNom",
      fte.service_mail AS "serviceMail",
      fte.service_telephone AS "serviceTelephone",
      (
        SELECT COUNT(DISTINCT usr.id)
        FROM back.users usr
        WHERE usr.ter_code = ter.code
      ) AS "nbUsersBo"
    FROM geo.territoires ter
    INNER JOIN back.fiche_territoire fte ON fte.ter_code = ter.code
    WHERE ter.code <> 'FRA'`,
  selectTerritoiresByInseeCode: (inseeCode) => [
    `
    SELECT
      ft.id,
      ft.ter_code AS "terCode",
      ft.service_mail AS "serviceMail",
      ft.service_telephone AS "serviceTelephone",
      ft.corresp_vao_nom AS "correspVaoNom",
      ft.corresp_vao_prenom AS "correspVaoPrenom",
      ft.edited_at AS "editedAt"
    FROM back.fiche_territoire ft
    JOIN geo.territoires t ON ft.ter_code = t.parent_code
    WHERE t.code = $1;
    `,
    [inseeCode],
  ],

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

module.exports.fetch = async (queryParams) => {
  const titles = [
    {
      key: "ter.code",
      queryKey: "code",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "ter.label",
      queryKey: "label",
      sortEnabled: true,
      type: "default",
    },
  ];

  const { limit, offset, sortBy, sortDirection } = sanitizePaginationParams(
    queryParams,
    titles,
  );
  const filterParams = sanitizeFiltersParams(queryParams, titles);

  const queryGet = query.select();
  const filterQuery = applyFilters(queryGet, [], filterParams);
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
    total: Number.parseInt(result[1].rows[0].total, 10),
  };
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

module.exports.getFichesTerritoireForRegionByInseeCode = async (InseeCode) => {
  const code = InseeCode.substring(0, 2);
  const { rows } = await pool.query(
    ...query.selectTerritoiresByInseeCode(code),
  );
  return rows[0];
};
