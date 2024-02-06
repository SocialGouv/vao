const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  select: (criterias) => [
    `
      SELECT 
        code as value,
        label as text
      FROM geo.territoires
      WHERE parent_code = 'FRA' 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
};

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");
  const fetch = await pool.query(...query.select(criterias));
  log.i("fetch - DONE");
  return fetch.rows;
};
