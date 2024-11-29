const AppError = require("../utils/error");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
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
  getFicheIdByTerCode: `
  select
        fte.id AS id
      FROM back.fiche_territoire fte
      WHERE ter_code = $1`,
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
      GROUP BY territoire_id,type,value,text,service_telephone,corresp_vao_nom,corresp_vao_prenom,service_mail
      ORDER BY type, text ASC`,
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

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");
  const { rows } = await pool.query(query.select);

  return rows.filter((territoire) => {
    return Object.entries(criterias).every(
      ([key, value]) => territoire[key] == value,
    );
  });
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
