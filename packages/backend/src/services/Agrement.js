/* eslint-disable no-param-reassign */
const fs = require("fs");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const poolDoc = require("../utils/pgpoolDoc").getPool();
const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  add: `
    INSERT INTO front.agrements(uuid,filename,operateur_id,numero,region_delivrance,date_obtention,date_fin_validite) 
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING
        uuid as "uuid"
    ;
    `,
  create: `
    INSERT INTO doc.agrements 
      (filename, mime_type, file) 
    VALUES 
      ( $1, $2, $3) 
    RETURNING uuid`,
  deleteByOperatorId: `UPDATE front.agrements 
                  SET supprime=true 
                  WHERE operateur_id=$1
                  `,
  getByOperateurId: `
    SELECT 
      id as "id",
      uuid AS "uuid",
      numero as "numero",
      filename as "filename",
      date_obtention::text as "dateObtention",
      date_fin_validite::text as "dateFinValidite"
    FROM front.agrements 
    WHERE operateur_id =$1 
    AND supprime=false`,
  getByUuid: `SELECT  uuid AS uuid,
                      filename as filename,
                      mime_type as mimeType,
                      file as file
    FROM doc.agrements 
    WHERE uuid =$1;`,
  updateOptions: `
    UPDATE front.agrements 
    SET numero = $2, 
      region_delivrance = $3, 
      date_obtention = $4, 
      date_fin_validite = $5
    WHERE operateur_id=$1
    AND supprime = false
    RETURNING id AS "agrementId"
  `,
};

module.exports.create = async (
  uuid,
  filename,
  operateurId,
  regionDelivrance,
  numeroAgrement,
  dateDelivrance,
  dateFinValidite,
) => {
  const response = await pool.query(query.add, [
    uuid,
    filename,
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

module.exports.getByUuid = async (uuid) => {
  log.i("In");
  try {
    const response = await poolDoc.query(query.getByUuid, [uuid]);
    if (response.rows.length > 0) {
      log.i("Done", response.rows[0]);
      return response.rows[0];
    }
    log.i("Done");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getByUuid failed", { cause: err });
  }
};
module.exports.getByOperateurId = async (operateurId) => {
  log.i("In");
  try {
    const response = await pool.query(query.getByOperateurId, [operateurId]);
    if (response.rows.length > 0) {
      log.i("Done", response.rows[0]);
      return response.rows[0];
    }
    log.i("Done");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getByUuid failed", { cause: err });
  }
};

module.exports.uploadFile = async (file) => {
  log.i("uploadFile - In");
  try {
    const { path } = file;
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    }).then(async (data) => {
      log.d("uploadFile", [file.originalname, file.mimetype, data]);
      const response = await poolDoc.query(query.create, [
        file.originalname,
        file.mimetype,
        data,
      ]);
      log.d("uploadFile - Done");
      return response.rows[0].uuid;
    });
  } catch (err) {
    log.w(err);
    throw new AppError("uploadFile failed", { cause: err });
  }
};

module.exports.deleteByOperatorId = async (operateurId) => {
  log.i("deleteByOperatorId - In");
  try {
    const response = await pool.query(query.deleteByOperatorId, [operateurId]);
    const ndDeletedAgrements = response.rowCount;
    log.i("deleteByOperatorId - Done");
    return ndDeletedAgrements;
  } catch (err) {
    log.w(err);
    throw new AppError("deleteByOperatorId failed", { cause: err });
  }
};

module.exports.updateOptions = async (
  operateurId,
  numero,
  regionDelivrance,
  dateObtention,
  dateFinValidite,
) => {
  log.i("updateOptions - In");
  try {
    const response = await pool.query(query.updateOptions, [
      operateurId,
      numero,
      regionDelivrance,
      dateObtention,
      dateFinValidite,
    ]);
    const updatedAgrementId = response.rows[0].agrementId;
    log.i("updateOptions - Done");
    return updatedAgrementId;
  } catch (err) {
    log.w(err);
    throw new AppError("updateOptions failed", { cause: err });
  }
};
