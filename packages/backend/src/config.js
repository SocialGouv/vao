module.exports = {
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.PG_VAO_USER,
    password: process.env.PG_VAO_PASSWORD,
    document: {
      user: process.env.PG_VAO_DOCUMENT_USER,
      password: process.env.PG_VAO_DOCUMENT_PASSWORD,
    },
  },

  resetPasswordToken: {
    expiresIn: 30 * 60 * 1000, // 30 min
    secret: process.env.RESET_PASSWORD_TOKEN_SECRET,
  },

  validationToken: {
    expiresIn: 5 * 60 * 1000, // 5 min
    secret: process.env.VALIDATION_TOKEN_SECRET,
  },
  accessToken: {
    algorithm: "RS256",
    expiresIn: 30 * 60 * 1000, // 30 min
    secret: process.env.ACCESS_TOKEN_SECRET,
  },
  refreshToken: {
    algorithm: "RS256",
    expiresIn: 4 * 60 * 60 * 1000, // 4h
    secret: process.env.REFRESH_TOKEN_SECRET,
  },

  smtp: {
    pool: process.env.SMTP_IS_POOLED !== "false",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_IS_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },

  apiEntreprise: {
    token: process.env.API_ENTREPRISE_TOKEN,
    uri: "https://entreprise.api.gouv.fr/v3",
    context: "vacances_adaptees_organisees",
    recipient: "13000680200016",
    object: "operateur_sejour_vao",
  },

  frontUsagersDomain: process.env.FRONTEND_USAGERS_URL,
  frontBODomain: process.env.FRONTEND_BO_URL,
  domain: process.env.BACKEND_URL,

  senderEmail: process.env.SENDER_EMAIL,
  tmpDirectory: process.env.TMP_DIRECTORY || "/tmp/",
};
