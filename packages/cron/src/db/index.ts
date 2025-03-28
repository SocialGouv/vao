import pg from "pg";
import { postgres } from "../config";

const configPool = {
  database: postgres.database,
  host: postgres.host,
  idleTimeoutMillis: 30000,
  max: 15,
  password: postgres.password,
  port: +postgres.port,
  ssl: postgres.ssl,
  user: postgres.user,
};

export const pool = new pg.Pool(configPool);

export const disconnect = () => pool.end();
