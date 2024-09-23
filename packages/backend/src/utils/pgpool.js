const pg = require("pg");

const config = require("../config");
const logger = require("./logger");

const log = logger(module.filename);

let pool;

const configPool = {
  database: config.postgres.database,
  host: config.postgres.host,
  idleTimeoutMillis: 30000,
  max: 15,
  password: config.postgres.password,
  port: config.postgres.port,
  ssl: config.ssl,
  user: config.postgres.user,
};

module.exports = {
  async disconnect() {
    if (!pool) {
      return;
    }
    log.i("disconnect - IN");
    await pool.end();
    log.i("disconnect - DONE");
  },
  // Retourne la pool Postgres, la crée si nécessaire
  getPool() {
    if (pool) return pool;
    log.i("getPool - connecting");
    pool = new pg.Pool(configPool);
    log.i("getPool - connected");
    return pool;
  },
};
