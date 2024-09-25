const pool = require("../utils/pgpool").getPool();

const query = {
  // simple query to check if the connexion to the db is up
  healthz: () => [`SELECT NOW();`, []],
};

module.exports.healthz = async () => {
  await pool.query(...query.healthz());
};
