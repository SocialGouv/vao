const pg = require("pg");

const logger = require("./logger");
const config = require("../config");

const log = logger(module.filename);
let pool;

const configPool = {
  database: config.postgres.database,
  host: config.postgres.host,
  idleTimeoutMillis: 30000,
  max: 15,
  password: config.postgres.document.password,
  port: config.postgres.port,
  ssl: config.postgres.ssl,
  user: config.postgres.document.user,
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

    if (process.env.NODE_ENV === "test") {
      if (!global.postgresContainer) {
        throw new Error("No Postgres container found");
      }
      configPool.host = global.postgresContainer.getHost();
      configPool.port = global.postgresContainer.getPort().toString();
      configPool.user = global.postgresContainer.getUsername();
      configPool.password = global.postgresContainer.getPassword();
      configPool.database = global.postgresContainer.getDatabase();
    }
    pool = new pg.Pool(configPool);

    log.i("getPool - connected");
    return pool;
  },
};
