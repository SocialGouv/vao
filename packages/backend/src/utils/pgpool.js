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
  ssl: config.postgres.ssl,
  user: config.postgres.user,
};

async function disconnect() {
  if (!pool) {
    return;
  }
  log.i("disconnect - IN");
  await pool.end();
  pool = undefined;
  log.i("disconnect - DONE");
}

// Retourne la pool Postgres, la crée si nécessaire
function getPool() {
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
}

async function withTransaction(callback) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  disconnect,
  getPool,
  withTransaction,
};
