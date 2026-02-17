const AppError = require("../../utils/error").default;
const logger = require("../../utils/logger");
const { getPool } = require("../../utils/pgpool");

const log = logger(module.filename);

const query = {
  select: `
      SELECT 
        code as value,
        label as text,
        parent_code as region
      FROM geo.territoires
      WHERE parent_code <> 'FRA'
      AND code <> 'FRA'
      ORDER BY code asc`,
};

let cache;

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");
  if (!cache) {
    const { rows } = await getPool().query(query.select);
    cache = rows;
  }
  const filters = Object.entries(criterias);
  const departements = cache.filter((departement) => {
    return filters.every(([key, value]) => departement[key] == value);
  });

  log.i("fetch - DONE");
  return departements;
};

module.exports.fetchOne = async (code) => {
  log.i("fetchOne - IN");
  if (!cache) {
    const { rows } = await getPool().query(query.select);
    cache = rows;
  }
  const departement = cache.find((departement) => departement.value === code);

  if (!departement) {
    throw new AppError(`Département ${code} non trouvé`);
  }

  log.i("fetchOne - DONE");
  return departement;
};
