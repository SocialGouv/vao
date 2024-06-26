module.exports = {
  accessToken: {
    algorithm: "RS256",
    expiresIn: 30 * 60 * 1000, // 30 min
    secret: process.env.ACCESS_TOKEN_SECRET,
  },

  antivirusUrl: process.env.ANTIVIRUS_URL,

  apiEntreprise: {
    context: "vacances_adaptees_organisees",
    object: "operateur_sejour_vao",
    recipient: "13000680200016",
    token: process.env.API_ENTREPRISE_TOKEN,
    uri: "https://entreprise.api.gouv.fr/v3",
  },

  apiInsee: {
    CLIENT_ID: process.env.API_INSEE_CLIENT_ID,
    CLIENT_SECRET: process.env.API_INSEE_CLIENT_SECRET,
    URI: process.env.API_INSEE_URI,
    URL: process.env.API_INSEE_URL,
  },
  domain: process.env.BACKEND_URL,
  frontBODomain: process.env.FRONTEND_BO_URL,

  frontUsagersDomain: process.env.FRONTEND_USAGERS_URL,

  postgres: {
    database: process.env.POSTGRES_DB,
    document: {
      password: process.env.PG_VAO_DOCUMENT_PASSWORD,
      user: process.env.PG_VAO_DOCUMENT_USER,
    },
    host: process.env.POSTGRES_HOST,
    password: process.env.PG_VAO_PASSWORD,
    port: process.env.POSTGRES_PORT,
    user: process.env.PG_VAO_USER,
  },

  refreshToken: {
    algorithm: "RS256",
    expiresIn: 4 * 60 * 60 * 1000, // 4h
    secret: process.env.REFRESH_TOKEN_SECRET,
  },
  resetPasswordToken: {
    expiresIn: 30 * 60 * 1000, // 30 min
    secret: process.env.RESET_PASSWORD_TOKEN_SECRET,
  },
  senderEmail: process.env.SENDER_EMAIL,
  sentry: {
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.SENTRY_ENABLED === "true",
    environment: process.env.SENTRY_ENVIRONMENT,
  },
  smtp: {
    auth: {
      pass: process.env.SMTP_PASSWORD,
      user: process.env.SMTP_USER,
    },
    host: process.env.SMTP_HOST,
    pool: process.env.SMTP_IS_POOLED !== "false",
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_IS_SECURE === "true",
  },
  tmpDirectory: process.env.TMP_DIRECTORY,
  tokenSecret: process.env.TOKEN_SECRET,
  validationToken: {
    expiresIn: 60 * 60 * 1000, // 30 min
    secret: process.env.VALIDATION_TOKEN_SECRET,
  },
};
