const AppError = require("../../utils/error");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const config = require("../../config");

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

let cache = {
  data: null,
  timestamp: 0,
};

let loadingPromise = null;

async function loadCache() {
  const now = Date.now();
  const isExpired = now - cache.timestamp > config.cacheTTL;
  if ((!cache.data || isExpired) && !loadingPromise) {
    loadingPromise = (async () => {
      log.i("Chargement en arrière-plan du cache des départements");
      const { rows } = await pool.query(query.select);
      cache = {
        data: rows,
        timestamp: Date.now(),
      };
      loadingPromise = null;
    })();
  }
}

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");

  await loadCache();

  const filters = Object.entries(criterias);
  const departements = cache.data.filter((departement) =>
    filters.every(([key, value]) => departement[key] == value),
  );

  log.i("fetch - DONE");
  return departements;
};

module.exports.fetchOne = async (code) => {
  log.i("fetchOne - IN");

  await loadCache();

  const departement = cache.data.find(
    (departement) => departement.value === code,
  );

  if (!departement) {
    throw new AppError(`Département ${code} non trouvé`);
  }

  log.i("fetchOne - DONE");
  return departement;
};
