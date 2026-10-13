import pg from "pg";
import { postgres } from "../config";

const configPool = {
  database: postgres.document.database,
  host: postgres.document.host,
  idleTimeoutMillis: 30000,
  max: 5,
  password: postgres.document.password,
  port: +postgres.document.port,
  ssl: postgres.ssl,
  user: postgres.document.user,
};

export const poolDoc = new pg.Pool(configPool);
