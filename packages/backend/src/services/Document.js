/* eslint-disable no-param-reassign */
const fs = require("node:fs/promises");
const logger = require("../utils/logger");
const poolDoc = require("../utils/pgpoolDoc").getPool();
const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  create: (category, filename, mime_type, file) => [
    `
    INSERT INTO doc.documents
      (category, filename, mime_type, file)
    VALUES
      ( $1, $2, $3, $4)
    RETURNING uuid`,
    [category, filename, mime_type, file],
  ],
  getByUuid: (uuid) => [
    `
    SELECT
      uuid,
      category,
      filename,
      mime_type as mimeType,
      file
    FROM doc.documents
    WHERE uuid = $1;`,
    [uuid],
  ],
};

module.exports.download = async (uuid) => {
  log.i("IN");
  try {
    const { rows, rowCount } = await poolDoc.query(...query.getByUuid(uuid));
    if (rowCount > 0) {
      log.i("DONE", rows[0]);
      return rows[0];
    }
    log.i("DONE");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getByUuid failed", { cause: err });
  }
};

module.exports.upload = async (category, file) => {
  log.i("uploadFile - In");
  try {
    const { path, originalname: filename } = file;
    const data = await fs.readFile(path);
    log.d("uploadFile", category, filename);
    const {
      rows: [{ uuid }],
    } = await poolDoc.query(
      ...query.create(category, filename, file.mimetype, data),
    );
    log.d("uploadFile - Done");
    return uuid;
  } catch (err) {
    log.w(err);
    throw new AppError("uploadFile failed", { cause: err });
  }
};

module.exports.createFile = async (filename, category, typeMime, data) => {
  log.i("createFile - In");
  try {
    log.i("createFile", { category, filename, typeMime });
    const {
      rows: [{ uuid }],
    } = await poolDoc.query(
      ...query.create(category, filename, typeMime, data),
    );
    log.i("createFile - Done");
    return uuid;
  } catch (err) {
    log.w(err);
    throw new AppError("createFile failed", { cause: err });
  }
};

module.exports.getStatic = async (name) => {
  log.i("getOrganisateurAvecUnRetrait - In");
  return `${__dirname}/static/${name}`;
};
