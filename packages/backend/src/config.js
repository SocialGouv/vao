module.exports = {
  accessToken: {
    algorithm: "RS256",
    expiresIn: 30 * 60 * 1000, // 30 min
    secret: process.env.ACCESS_TOKEN_SECRET,
  },

  apiEntreprise: {
    context: "vacances_adaptees_organisees",
    object: "operateur_sejour_vao",
    recipient: "13000680200016",
    token: process.env.API_ENTREPRISE_TOKEN,
    uri: "https://entreprise.api.gouv.fr/v3",
  },

  apiInsee: {
    CLIENT_ID: "6T06xbS2BqMJtOtnlhx7yyT01XYa",
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    URL: "https://api.insee.fr",
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
  validationToken: {
    expiresIn: 5 * 60 * 1000, // 5 min
    secret: process.env.VALIDATION_TOKEN_SECRET,
  },
};
