/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const { getPool } = require("../utils/pgpool");

const log = logger(module.filename);

const query = {
  getLibelle: `
    select libelle 
    FROM referentiel.categorie_juridique
    WHERE code = $1;
    `,
};

module.exports.getLibelle = async (code) => {
  log.i("getLibelle - IN", { code });
  const response = await getPool().query(query.getLibelle, [code]);
  const libelle =
    response && response.rows[0] ? response.rows[0].libelle : code;
  log.d("getLibelle - DONE");
  return libelle;
};
