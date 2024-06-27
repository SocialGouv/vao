const format = require("pg-format");
const pool = require("../utils/pgpool").getPool();

const logger = require("../utils/logger");

const log = logger(module.filename);

const query = (uuid, duration, error, message) =>
  format(
    `
    UPDATE back.crons
    SET
      cro_duration = %s,
      cro_error = %L,
      cro_message = %L
    WHERE cro_name = %L
`,
    duration,
    error,
    message,
    uuid,
  );

module.exports = async function save(uuid, duration, error, message) {
  log.d(`IN`);
  await pool.query(query(uuid, duration, error, message));
  log.d(`DONE`);
};
