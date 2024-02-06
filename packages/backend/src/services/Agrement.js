/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  add: `
    INSERT INTO front.agrements(uuid,operateur_id,numero,region_delivrance,date_obtention,date_fin_validite) 
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING
        uuid as "uuid"
    ;
    `,
};

module.exports.create = async (
  uuid,
  operateurId,
  regionDelivrance,
  numeroAgrement,
  dateDelivrance,
  dateFinValidite
) => {
  log.i("create - IN");
  const response = await pool.query(query.add, [
    uuid,
    operateurId,
    numeroAgrement,
    regionDelivrance,
    dateDelivrance,
    dateFinValidite,
  ]);
  const newUuid = response.rows[0].uuid;
  log.d("create - DONE", { uuid: newUuid });
  return uuid;
};
