import { Pool, PoolClient } from "pg";

import { config } from "../config";
import { logger } from "./logger";

const log = logger(module.filename);

let pool: Pool | undefined;

const configPool = {
  database: config.postgres.database,
  host: config.postgres.host,
  idleTimeoutMillis: 30000,
  max: 15,
  password: config.postgres.password,
  port: Number(config.postgres.port),
  ssl: config.postgres.ssl,
  user: config.postgres.user,
};

export async function disconnect() {
  if (!pool) {
    return;
  }
  log.i("disconnect - IN");
  await pool.end();
  pool = undefined;
  log.i("disconnect - DONE");
}

// Retourne la pool Postgres, la crée si nécessaire
export function getPool() {
  if (pool) return pool;
  log.i("getPool - connecting");

  if (process.env.NODE_ENV === "test") {
    if (!global.postgresContainer) {
      throw new Error("No Postgres container found");
    }
    configPool.host = global.postgresContainer.getHost();
    configPool.port = global.postgresContainer.getPort();
    configPool.user = global.postgresContainer.getUsername();
    configPool.password = global.postgresContainer.getPassword();
    configPool.database = global.postgresContainer.getDatabase();
  }

  pool = new Pool(configPool);
  log.i("getPool - connected");
  return pool;
}

export type TransactionClient = PoolClient;

export async function withTransaction<T>(
  // eslint-disable-next-line no-unused-vars
  callback: (tx: TransactionClient) => Promise<T>,
) {
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
