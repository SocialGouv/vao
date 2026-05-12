import { getPool } from "../utils/pgpool";

const query = {
  // simple query to check if the connexion to the db is up
  healthz: (): [string, unknown[]] => [`SELECT NOW();`, []],
};

export const healthz = async () => {
  await getPool().query(...query.healthz());
};
