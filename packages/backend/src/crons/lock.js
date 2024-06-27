const dayjs = require("dayjs");
const pool = require("../utils/pgpool").getPool();

const logger = require("../utils/logger");

const log = logger(module.filename);

const queryInsert = (uuid) => [
  `
    INSERT INTO back.crons
    (
        cro_name
    )
    VALUES (
        $1
    )
`,
  [uuid],
];

module.exports = async function lock(lastDate, name) {
  log.d(`IN`);
  const uuid = `${name}-${dayjs(lastDate).format("YYMMDDTHHmm")}`;
  await pool.query(...queryInsert(uuid));
  log.d(`DONE`);
  return uuid;
};
