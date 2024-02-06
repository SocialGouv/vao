module.exports = {
  postgres: {
    host: process.env.POSTGRES_HOST || "pg",
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || "vao",
    databaseDocument: process.env.POSTGRES_DB_DOCUMENT || "document",
    user: process.env.POSTGRES_USER || "u_front",
    password: process.env.POSTGRES_PWD || "front",
    secretKey:
      process.env.POSTGRES_SECRET_KEY || "AV9YooDkY83dWQj8jfx4BxgGSQ8okW",
  },

  resetPasswordToken: {
    expiresIn: 30 * 60 * 1000, // 30 min
    secret:
      "bb57da4ea44115a1d59084a172cfd61bac6fa469592bd9abd0f91a108c1ccd9e0f2b945526890376e1c0a11566bbd81270c8140f27bf5791c6e2a5314f750681",
  },

  validationToken: {
    expiresIn: 5 * 60 * 1000, // 5 min
    secret:
      "bb57da4ea44115a1d59084a172cfd61bac6fa469592bd9abd0f91a108c1ccd9e0f2b945526890376e1c0a11566bbd81270c8140f27bf5791c6e2a5314f750681",
  },
  accessToken: {
    algorithm: "RS256",
    expiresIn: 30 * 60 * 1000, // 30 min
    secret:
      "bb57da4ea44115a1d59084a172cfd61bac6fa469592bd9abd0f91a108c1ccd9e0f2b945526890376e1c0a11566bbd81270c8140f27bf5791c6e2a5314f750681",
  },
  refreshToken: {
    algorithm: "RS256",
    expiresIn: 4 * 60 * 60 * 1000, // 4h
    secret:
      "2972e567cc46d282221878cec5fd92022874de3ea14b29241900e2d4f182df3b08e7739c3f7822474d0d9dadee6f4056bd52e7e0ec0f5d638adf4debd809e17e",
  },
  refreshTokenValidity: 4 * 3_600_000, // 4h
  sessionRefreshSecret:
    "2972e567cc46d282221878cec5fd92022874de3ea14b29241900e2d4f182df3b08e7739c3f7822474d0d9dadee6f4056bd52e7e0ec0f5d638adf4debd809e17e",
  // secret pour JWT

  // PATH_SUPERVISION_BATCH: process.env.PATH_SUPERVISION_BATCH || "/var/tmp/",
  MAIL_URL: process.env.MAIL_URL,

  SENDER_EMAIL: process.env.SENDER_EMAIL || "nepasrepondre@vao.social.gouv.fr",
  // FRONT DOMAIN est utilisé pour les liens dans les mails
  FRONT_DOMAIN: process.env.FRONT_DOMAIN || "http://localhost/front",

  API_INSEE: {
    CLIENT_ID: process.env.INSEE_CLIENT_ID || "6T06xbS2BqMJtOtnlhx7yyT01XYa",
    CLIENT_SECRET:
      process.env.INSEE_CLIENT_SECRET || "o2RV6ZeSUDbacFWT5AIftscYzUwa",
  },

  TMP_DIRECTORY: process.env.TMP_DIRECTORY || "/tmp/",
};
