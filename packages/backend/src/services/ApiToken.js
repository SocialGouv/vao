const { getPool } = require("../utils/pgpool");

const getApiTokenQuery = `
  SELECT
    ak.api_token AS "apiToken",
    ak.expires_at AS "expiresAt"
  FROM front.api_keys ak
  WHERE ak.user_id = $1
`;

const createOrUpdateApiTokenQuery = `
  INSERT INTO front.api_keys (user_id, api_token, created_at, expires_at)
  VALUES ($1, $2, NOW(), $3)
  ON CONFLICT (user_id)
  DO UPDATE SET
    api_token = EXCLUDED.api_token,
    created_at = NOW(),
    expires_at = EXCLUDED.expires_at
`;

module.exports.getApiToken = async (userId) => {
  const result = await getPool().query(getApiTokenQuery, [userId]);
  if (result.rows.length === 0) {
    return { apiToken: null, expiresAt: null };
  }
  return result.rows[0];
};

module.exports.createOrUpdateApiToken = async ({
  apiToken,
  expiresAt,
  userId,
}) => {
  await getPool().query(createOrUpdateApiTokenQuery, [
    userId,
    apiToken,
    expiresAt,
  ]);
  return { apiToken, expiresAt };
};
