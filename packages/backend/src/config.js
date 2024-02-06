module.exports = {
  postgres: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    databaseDocument: process.env.PGDATABASE_DOCUMENT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    secretKey:
      process.env.POSTGRES_SECRET_KEY,
  },

  resetPasswordToken: {
    expiresIn: 30 * 60 * 1000, // 30 min
    secret:
      process.env.RESET_PASSWORD_TOKEN_SECRET,
  },

  validationToken: {
    expiresIn: 5 * 60 * 1000, // 5 min
    secret:
    process.env.VALIDATION_TOKEN_SECRET,
  },
  accessToken: {
    algorithm: "RS256",
    expiresIn: 30 * 60 * 1000, // 30 min
    secret:
    process.env.ACCESS_TOKEN_SECRET,
  },
  refreshToken: {
    algorithm: "RS256",
    expiresIn: 4 * 60 * 60 * 1000, // 4h
    secret:
    process.env.REFRESH_TOKEN_SECRET,
  },

  smtp: {
    pool: process.env.SMTP_IS_POOLED !== "false",
    host: process.env.SMTP_HOST || "localhost",
    port: process.env.SMTP_PORT || 25,
    secure: process.env.SMTP_IS_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },

  mailUrl: process.env.MAIL_URL,

  senderEmail: process.env.SENDER_EMAIL,
  frontDomain: process.env.FRONT_DOMAIN,

  apiInsee: {
    clientId: process.env.API_INSEE_CLIENT_ID,
    clientSecret: process.env.API_INSEE_CLIENT_SECRET,
  },

  tmpDirectory: process.env.TMP_DIRECTORY,
};
