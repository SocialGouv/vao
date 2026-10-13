export const notifyDs8jDs15 = {
  cron: process.env.BACKEND_CRON_REQUEST_DS8J15J_NOTIFY_CRON,
  deadlineRemind: process.env.BACKEND_CRON_REQUEST_DS8J15J_DEADLINE_REMIND,
  name: "REQUEST_DS8J15J",
};

export const notifyCompteInactif2m = {
  cron: process.env.BACKEND_CRON_REQUEST_ACCOUNT2M_NOTIFY_CRON,
  name: "REQUEST_ACCOUNT2M",
};

export const disableAccount3m = {
  cron: process.env.BACKEND_CRON_DISABLE_ACCOUNT_3M_CRON,
  name: "DISABLE_ACCOUNT_3M",
};

export const notifyRequestActionsBo = {
  cron: process.env.BACKEND_CRON_REQUEST_ACTIONS_BO_CRON,
  name: "REQUEST_ACTIONS_BO",
};

export const updateStatusDs = {
  cron: process.env.BACKEND_CRON_UPDATE_STATUT_DS_CRON,
  name: "UPDATE_STATUT_DS",
};

export const notifySuppressionCompteInactif = {
  cron: process.env.BACKEND_CRON_SUPPRESSION_COMPTE_INACTIF_NOTIFY,
  name: "SUPPRESSION_COMPTE_INACTIF_NOTIFY",
};

export const suppressionCompteInactif = {
  cron: process.env.BACKEND_CRON_SUPPRESSION_COMPTE_INACTIF,
  name: "SUPPRESSION_COMPTE_INACTIF",
};

export const updateAndNotifySva = {
  cron: process.env.BACKEND_CRON_UPDATE_AND_NOTIFY_SVA,
  name: "UPDATE_AND_NOTIFY_SVA",
};

export const notifyAgrementExpiration = {
  cron: process.env.BACKEND_CRON_REQUEST_AGREMENT_NOTIFY_CRON,
  name: "REQUEST_AGREMENT",
};

export const migrateFilesToS3 = {
  batchSize: Number(
    process.env.BACKEND_CRON_MIGRATE_FILES_TO_S3_BATCH_SIZE || 500,
  ),
  cron: process.env.BACKEND_CRON_MIGRATE_FILES_TO_S3 || "*/15 * * * *",
  name: "MIGRATE_FILES_TO_S3",
};

export const postgres = {
  database: process.env.POSTGRES_DB,
  document: {
    database: process.env.POSTGRES_DOCUMENT_DB,
    host: process.env.POSTGRES_DOCUMENT_HOST,
    password: process.env.PG_VAO_DOCUMENT_PASSWORD,
    port: process.env.POSTGRES_DOCUMENT_PORT,
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
};

export const s3 = {
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY!,
  bucketName: process.env.S3_BUCKET_NAME!,
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  region: process.env.S3_BUCKET_REGION!,
  rootDir: process.env.S3_BUCKET_ROOT_DIR!,
  secretAccessKey: process.env.S3_BUCKET_SECRET_KEY!,
};

export const domains = {
  frontBODomain: process.env.FRONTEND_BO_URL,
  frontUsagersDomain: process.env.FRONTEND_USAGERS_URL,
};

export const senderEmail = process.env.SENDER_EMAIL;

export const smtp = {
  auth: {
    pass: process.env.SMTP_PASSWORD,
    user: process.env.SMTP_USER,
  },
  host: process.env.SMTP_HOST,
  pool: process.env.SMTP_IS_POOLED !== "false",
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_IS_SECURE === "true",
};

export const sentry = {
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.SENTRY_ENABLED === "true",
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
};
