const { getPool } = require("../utils/pgpool");

const query = {
  // simple query to check if the connexion to the db is up
  healthz: () => [`SELECT NOW();`, []],
};

module.exports.healthz = async () => {
  await getPool().query(...query.healthz());
};
