const AppError = require("../../utils/error");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  select: `
  SELECT 
    code as value,
    label as text
  FROM geo.territoires
  WHERE parent_code = 'FRA' 
  `,
};

let cache;

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");
  if (!cache) {
    const { rows } = await pool.query(query.select);
    cache = rows;
  }
  const filters = Object.entries(criterias);
  const regions = cache.filter((region) => {
    return filters.every(([key, value]) => region[key] == value);
  });

  log.i("fetch - DONE");
  return regions;
};

module.exports.fetchOne = async (code) => {
  log.i("fetchOne - IN", { cache, code });
  if (!cache) {
    const { rows } = await pool.query(query.select);
    cache = rows;
  }

  const region = cache.find((region) => region.value === code);

  if (!region) {
    throw new AppError(`Région ${code} non trouvée`);
  }

  log.i("fetchOne - DONE");
  return region;
};
