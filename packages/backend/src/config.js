const apiEntrepriseBaseUrl = "https://entreprise.api.gouv.fr";
const assistanceBaseUrl = "https://vao-assistance.atlassian.net";

module.exports = {
  accessToken: {
    expiresIn: 30 * 60 * 1000, // 30 min
  },

  algorithm: "HS256",

  antivirusUrl: process.env.ANTIVIRUS_URL,

  apiAdresse: {
    url: "https://api-adresse.data.gouv.fr",
  },

  apiEntreprise: {
    context: "vacances_adaptees_organisees",
    object: "operateur_sejour_vao",
    recipient: "13000680200016",
    token: process.env.API_ENTREPRISE_TOKEN,
    uri: `${apiEntrepriseBaseUrl}/v3`,
    url: apiEntrepriseBaseUrl,
  },

  apiInsee: {
    TOKEN: process.env.API_INSEE_TOKEN,
    URI: process.env.API_INSEE_URI,
    URL: process.env.API_INSEE_URL,
  },
  apiToken: {
    expiresIn: 365 * 24 * 60 * 60 * 1000,
  },
  assistance: {
    uriFaq: `${assistanceBaseUrl}/servicedesk/customer/portals`,
    uriNewRequest: `${assistanceBaseUrl}/servicedesk/customer/portal/1/group/2/create/10`,
  },
  authentification: {
    lockoutTime: 15,
    maxLoginAttempts: 5,
  },
  crons: {
    request: {
      notify: {
        cron: process.env.BACKEND_CRON_REQUEST_DS8J15J_NOTIFY_CRON,
        deadlineRemind:
          process.env.BACKEND_CRON_REQUEST_DS8J15J_DEADLINE_REMIND,
        name: "REQUEST_DS8J15J",
      },
      notifyCompteInactif2m: {
        cron: process.env.BACKEND_CRON_REQUEST_ACCOUNT2M_NOTIFY_CRON,
        name: "REQUEST_ACCOUNT2M",
      },
      notifyactionsbo: {
        cron: process.env.BACKEND_CRON_REQUEST_ACTIONS_BO_CRON,
        name: "REQUEST_ACTIONS_BO",
      },
      update: {
        cron: process.env.BACKEND_CRON_UPDATE_STATUT_DS_CRON,
        name: "UPDATE_STATUT_DS",
      },
    },
  },
  domain: process.env.BACKEND_URL,
  frontBODomain: process.env.FRONTEND_BO_URL,

  frontUsagersDomain: process.env.FRONTEND_USAGERS_URL,

  postgres: {
    cipherData: process.env.PG_VAO_CIPHER_DATA,
    database: process.env.POSTGRES_DB,
    document: {
      password: process.env.PG_VAO_DOCUMENT_PASSWORD,
      user: process.env.PG_VAO_DOCUMENT_USER,
    },
    host: process.env.POSTGRES_HOST,
    password: process.env.PG_VAO_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.PGSSLMODE
      ? {
          rejectUnauthorized: false, // to authorize CNPG self-signed certificates
        }
      : false,
    user: process.env.PG_VAO_USER,
  },

  refreshToken: {
    expiresIn: 4 * 60 * 60 * 1000, // 4h
  },
  resetPasswordToken: {
    expiresIn: 30 * 60 * 1000, // 30 min
  },
  senderEmail: process.env.SENDER_EMAIL,
  sentry: {
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.SENTRY_ENABLED === "true",
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
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
  tokenSecret: process.env.TOKEN_SECRET_LINK,
  tokenSecret_BO: process.env.TOKEN_SECRET_BO,
  tokenSecret_FO: process.env.TOKEN_SECRET_FO,
  validationToken: {
    expiresIn: 60 * 60 * 1000, // 1h
  },
};
