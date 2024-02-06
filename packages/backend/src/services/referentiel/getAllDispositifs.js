const pgPool = require("../../pgpool").getPool();
const logger = require("../../utils/logger");

const log = logger(module.filename);
const requete = `
SELECT 
  d.com_dis_code AS code,
  d.com_dis_label AS label,
  json_agg(json_build_object(
    'code', ssd.com_ssd_code,
    'label', ssd.com_ssd_label
  )) AS "sousDispositifs"
FROM 
  common.dispositifs d
INNER JOIN common.sousdispositifs ssd 
  ON d.com_dis_code = ssd.com_dis_code
WHERE com_ssd_is_pp is True
GROUP BY d.com_dis_code, d.com_dis_label;
  `;

module.exports = async () => {
  log.i("IN");
  try {
    const dispositifs = await pgPool.query(requete);
    log.i("Done");
    return dispositifs.rows;
  } catch (err) {
    log.w(err);
    throw new Error(err);
  }
};
