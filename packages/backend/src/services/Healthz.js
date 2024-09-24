const pool = require("../utils/pgpool").getPool();

const query = {
  // simple query to check if the connexion to the db is up
  healthz: () => [`SELECT rol_id FROM back.user_roles LIMIT 1;`, []],
};

module.exports.healthz = async () => {
  await pool.query(...query.healthz());
};
