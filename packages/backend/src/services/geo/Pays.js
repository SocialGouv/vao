const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  select: (criterias) => [
    `
      SELECT 
      geo_pay_code as value,
      geo_pay_label as text
      FROM geo.pays
      WHERE 1=1 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      ORDER BY geo_pay_label`,
    Object.values(criterias),
  ],
};

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");
  const fetch = await pool.query(...query.select(criterias));
  log.i("fetch - DONE");
  return fetch.rows;
};

module.exports.get = async (paysCode) => {
  log.i("get - IN");
  const { rows, rowCount } = await pool.query(
    ...query.select({ geo_pay_code: paysCode })
  );
  log.i("get - DONE");
  if (rowCount > 0) {
    return rows[0];
  }
  return null;
};
