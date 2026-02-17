const { authentification } = require("../../config");

const logger = require("../../utils/logger");
const { getPool } = require("../../utils/pgpool");
const normalize = require("../../utils/normalize");

const log = logger(module.filename);

const query = {
  acceptCgu: (userSchema) => `
    UPDATE ${userSchema}.users
    SET
      cgu_accepted = true,
      cgu_accepted_at = NOW()
    WHERE
      id = $1
    returning id, mail as email, cgu_accepted, cgu_accepted_at
  `,

  getLoginAttempt: (userSchema) => `
    SELECT
      id,
      mail,
      attempt_count,
      ROUND(COALESCE(EXTRACT(EPOCH FROM (NOW() - MAX(attempt_at))) / 60, 0)) AS minutes_since_last_attempt
    FROM ${userSchema}.login_attempts
    WHERE mail = $1
    GROUP BY id, mail`,
  insertLoginAttempt: (userSchema) => `
      INSERT INTO ${userSchema}.login_attempts (mail, ip_address, attempt_count)
      VALUES ($1, $2, 1)
      `,
  resetLoginAttempt: (userSchema) => `
    UPDATE ${userSchema}.login_attempts
      SET
        attempt_count = 0
    WHERE mail = $1`,
  updateLoginAttempt: (userSchema) => `
    UPDATE ${userSchema}.login_attempts
      SET
        ip_address = $2,
        attempt_count = attempt_count + 1,
        attempt_at = NOW()
      WHERE mail = $1`,
};

module.exports.acceptCgu = async ({ userId, userSchema }) => {
  log.i("acceptCgu - IN", { userId });
  const user = await getPool().query(query.acceptCgu(userSchema), [userId]);
  log.i("acceptCgu - DONE");
  return user.rowCount === 0 ? null : user.rows[0];
};

module.exports.verifyLoginAttempt = async (email, userSchema) => {
  log.i("verifyLoginAttempt - IN", { email });
  const response = await getPool().query(query.getLoginAttempt(userSchema), [
    normalize(email),
  ]);
  if (response.rows.length === 0) {
    log.i("verifyLoginAttempt - DONE - No attempt found");
    return false;
  }
  const account = response.rows[0];
  log.d("verifyLoginAttempt", { account });
  if (account.attempt_count >= authentification.maxLoginAttempts) {
    log.w("verifyLoginAttempt - DONE - Too many attempts");
    if (account.minutes_since_last_attempt > authentification.lockoutTime) {
      getPool().query(query.resetLoginAttempt(userSchema), [normalize(email)]);
      log.i("verifyLoginAttempt - DONE - Resetting attempt count");
      return false;
    }
    return true;
  }
  log.i("verifyLoginAttempt - DONE - Valid attempt");
  return false;
};

module.exports.recordLoginAttempt = async (email, ipAddress, userSchema) => {
  log.i("recordLoginAttempt - IN", { email, ipAddress });
  const response = await getPool().query(query.getLoginAttempt(userSchema), [
    normalize(email),
  ]);
  if (response.rows.length === 0) {
    log.i("recordLoginAttempt - No previous attempt found, creating new one");
    getPool().query(query.insertLoginAttempt(userSchema), [
      normalize(email),
      ipAddress,
    ]);
  } else {
    log.i("recordLoginAttempt - Incrementing attempt count");
    getPool().query(query.updateLoginAttempt(userSchema), [
      normalize(email),
      ipAddress,
    ]);
  }
  log.i("recordLoginAttempt - DONE");
};

module.exports.resetLoginAttempt = (email, userSchema) => {
  log.i("resetLoginAttempt - IN", { email });
  getPool().query(query.resetLoginAttempt(userSchema), [normalize(email)]);
  log.i("resetLoginAttempt - DONE");
};
