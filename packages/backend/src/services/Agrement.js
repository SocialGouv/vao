/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  create: (
    organismeId,
    numero,
    regionObtention,
    dateObtention,
    dateFinValidite,
    file,
  ) => [
    `
    INSERT INTO front.agrements(organisme_id, numero, region_obtention, date_obtention, date_fin_validite, file) 
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id AS "agrementId"
    ;`,
    [
      organismeId,
      numero,
      regionObtention,
      dateObtention,
      dateFinValidite,
      file,
    ],
  ],
  deleteByOrganismeId: (organismeId) => [
    `
    UPDATE front.agrements 
    SET supprime = true 
    WHERE organisme_id = $1
  `,
    [organismeId],
  ],
  getByOrganismeId: (organismeId) => [
    `
    SELECT 
      id,
      numero,
      file,
      date_obtention::text as "dateObtention",
      date_fin_validite::text as "dateFinValidite"
    FROM front.agrements 
    WHERE 
      organisme_id =$1 
      AND supprime=false
  `,
    [organismeId],
  ],
  update: (
    organismeId,
    numero,
    regionObtention,
    dateObtention,
    dateFinValidite,
    file,
  ) => [
    `
    UPDATE front.agrements 
    SET 
      numero = $2, 
      region_obtention = $3, 
      date_obtention = $4, 
      date_fin_validite = $5,
      file = $6
    WHERE 
      organisme_id = $1
      AND supprime = false
    RETURNING id AS "agrementId"
    `,
    [
      organismeId,
      numero,
      regionObtention,
      dateObtention,
      dateFinValidite,
      file,
    ],
  ],
};

module.exports.create = async (
  organismeId,
  numero,
  regionObtention,
  dateObtention,
  dateFinValidite,
  file,
) => {
  const {
    rows: [{ id: agrementId }],
  } = await pool.query(
    ...query.create(
      organismeId,
      numero,
      regionObtention,
      dateObtention,
      dateFinValidite,
      file,
    ),
  );
  log.d("create - DONE", { agrementId });
  return agrementId;
};

module.exports.getByOrganismeId = async (organismeId) => {
  log.i("IN");
  try {
    const response = await pool.query(...query.getByOrganismeId(organismeId));
    if (response.rows.length > 0) {
      log.i("DONE", response.rows[0]);
      return response.rows[0];
    }
    log.i("DONE");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getByUuid failed", { cause: err });
  }
};

module.exports.update = async (
  organismeId,
  numero,
  regionObtention,
  dateObtention,
  dateFinValidite,
  file,
) => {
  log.i("update - In");
  try {
    const { rows, rowCount } = await pool.query(
      ...query.update(
        organismeId,
        numero,
        regionObtention,
        dateObtention,
        dateFinValidite,
        file,
      ),
    );
    if (rowCount === 0) {
      throw new AppError("Agrément non trouvé", { statusCode: 404 });
    }
    const updatedAgrementId = rows[0].agrementId;
    log.i("update - Done");
    return updatedAgrementId;
  } catch (err) {
    log.w(err);
    throw new AppError("update failed", { cause: err });
  }
};

module.exports.deleteByOrganismeId = async (organismeId) => {
  log.i("deleteByOrganismeId - In");
  try {
    const { rowCount: ndDeletedAgrements } = await pool.query(
      ...query.deleteByOrganismeId(organismeId),
    );
    log.i("deleteByOrganismeId - Done");
    return ndDeletedAgrements;
  } catch (err) {
    log.w(err);
    throw new AppError("deleteByOrganismeId failed", { cause: err });
  }
};
