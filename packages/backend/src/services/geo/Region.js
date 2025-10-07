const AppError = require("../../utils/error");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const config = require("../../config");

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
      log.i("Chargement en arrière-plan du cache des régions");
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
  const regions = cache.data.filter((region) =>
    filters.every(([key, value]) => region[key] == value),
  );

  log.i("fetch - DONE");
  return regions;
};

module.exports.fetchOne = async (code) => {
  log.i("fetchOne - IN", { code });

  await loadCache();

  const region = cache.data.find((region) => region.value === code);

  if (!region) {
    throw new AppError(`Région ${code} non trouvée`);
  }

  log.i("fetchOne - DONE");
  return region;
};
