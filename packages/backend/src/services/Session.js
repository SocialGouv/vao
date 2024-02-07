const pgPool = require("../utils/pgpool").getPool();
const logger = require("../utils/logger");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = `
    INSERT INTO front.sessions 
        (cle, refresh_token) 
    VALUES 
        ($1, $2) 
    RETURNING id
`;

module.exports.create = async (userId, refreshToken) => {
  log.i("IN");
  const id = await pgPool.query(query, [userId, refreshToken]);
  if (!id) {
    log.w(`::post - Le token n'a pas pu être sauvé en session`);
    throw new AppError("Le token n'a pas pu être sauvé en session", {
      name: "PostSessionError",
    });
  }

  log.i("Done");
  return id;
};
