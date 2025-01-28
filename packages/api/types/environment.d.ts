declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      SENTRY_DSN: string;
      SENTRY_ENABLED: string;
      SENTRY_ENVIRONMENT: string;
      SENTRY_RELEASE: string;
      POSTGRES_DB: string;
      PG_VAO_DOCUMENT_PASSWORD: string;
      PG_VAO_DOCUMENT_USER: string;
      POSTGRES_HOST: string;
      PG_VAO_PASSWORD: string;
      POSTGRES_PORT: string;
      PGSSLMODE: string;
      PG_VAO_USER: string;
      S3_BUCKET_ACCESS_KEY: string;
      S3_BUCKET_ENDPOINT: string;
      S3_BUCKET_REGION: string;
      S3_BUCKET_SECRET_KEY: string;
      S3_BUCKET_NAME: string;
      S3_BUCKET_ROOT_DIR: string;
    }
  }
}

export {};
