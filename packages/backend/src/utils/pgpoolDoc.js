const pg = require("pg");

const logger = require("./logger");
const config = require("../config");

const log = logger(module.filename);
let pool;

const configPool = {
  host: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.database,
  user: config.postgres.document.user,
  password: config.postgres.document.password,
  max: 15,
  idleTimeoutMillis: 30000,
};

module.exports = {
  // Retourne la pool Postgres, la crée si nécessaire
  getPool() {
    if (pool) return pool;
    log.i("getPool - connecting");
    pool = new pg.Pool(configPool);
    log.i("getPool - connected");
    return pool;
  },
  async disconnect() {
    if (!pool) {
      return;
    }
    log.i("disconnect - IN");
    await pool.end();
    log.i("disconnect - DONE");
  },
};
