const { email } = require("../controllers/authentication");
const telephone = require("../schemas/parts/telephone");
const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  getOne: (idTerritoire) => [`
    select
        fte.id AS territoire_id,
        CASE (ter.code ~ '[0-9]')
        	WHEN true THEN 'DEP'
 			    ELSE 'REG'
        END AS type,
        ter.code AS value,
        ter.label AS text,
        fte.service_mail AS service_mail,
        fte.service_telephone AS service_telephone, 
        fte.corresp_vao_nom AS corresp_vao_nom,
        fte.corresp_vao_prenom AS corresp_vao_prenom,
        fte.edited_at AS edited_at
      FROM back.fiche_territoire fte
      INNER JOIN geo.territoires ter ON fte.ter_code = ter.code
      WHERE fte.id = $1`,
    [idTerritoire],
  ],
  select: `
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
      WHERE code <> 'FRA'
      GROUP BY 1, 2, 3, 4, 5
      ORDER BY 2, 4 ASC`,
  update: (id, nom, prenom, email, telephone) => [
    `
      UPDATE back.fiche_territoire
      SET
        corresp_vao_nom = $2,
        corresp_vao_prenom = $3,
        service_mail = $4,
        service_telephone = $5, 
        edited_at = NOW()
      WHERE
        id = $1
      `,
    [id, nom, prenom, email, telephone],
  ],
};

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");
  const { rows } = await pool.query(query.select);

  const filters = Object.entries(criterias);
  const territoires = rows.filter((territoire) => {
    return filters.every(([key, value]) => territoire[key] == value);
  });

  log.i("fetch - DONE");
  return territoires;
};

module.exports.readOne = async (idTerritoire) => {
  log.i("fetch - IN");
  const { rows } = await pool.query(...query.getOne(idTerritoire));
  log.i("fetch - DONE");
  const territoires = rows;
  return territoires;
};

module.exports.update = async (id, { nom, prenom, email, telephone }) => {
  log.i("update - IN", { id });
  if (!id) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const { rowCount } = await pool.query(
    ...query.update(id, nom, prenom, email, telephone),
  );

  if (rowCount === 0) {
    log.d("update - DONE - fiche territoire inexistante");
    throw new AppError("Fiche territoire déjà inexistant", {
      name: "FicheTerritoireNotFound",
    });
  }

  log.i("update - DONE");
  return { code: "MajCompte" };
};