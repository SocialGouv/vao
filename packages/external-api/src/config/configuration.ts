export default () => ({
  nodeEnv: process.env.NODE_ENV,
  postgres: {
    cipherData: process.env.PG_VAO_CIPHER_DATA,
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
  },
  s3: {
    accesskey: process.env.S3_BUCKET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
    endpoint: process.env.S3_BUCKET_ENDPOINT,
    region: process.env.S3_BUCKET_REGION,
    rootDir: process.env.S3_BUCKET_ROOT_DIR,
    secretKey: process.env.S3_BUCKET_SECRET_KEY,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.SENTRY_ENABLED === "true",
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
  },
});
