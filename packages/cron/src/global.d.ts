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
      PG_VAO_CIPHER_DATA: string;
      POSTGRES_HOST: string;
      PG_VAO_PASSWORD: string;
      POSTGRES_PORT: string;
      PGSSLMODE: string;
      PG_VAO_USER: string;
      BACKEND_CRON_REQUEST_ACCOUNT2M_NOTIFY_CRON: string;
      BACKEND_CRON_REQUEST_DS8J15J_NOTIFY_CRON: string;
      BACKEND_CRON_REQUEST_DS8J15J_DEADLINE_REMIND: string;
      BACKEND_CRON_REQUEST_ACTIONS_BO_CRON: string;
      BACKEND_CRON_UPDATE_STATUT_DS_CRON: string;
      BACKEND_CRON_DISABLE_ACCOUNT_3M_CRON: string;
      FRONTEND_USAGERS_URL: string;
      FRONTEND_BO_URL: string;
      SENDER_EMAIL: string;
      SMTP_HOST: string;
      SMTP_IS_POOLED: string;
      SMTP_PORT: string;
      SMTP_IS_SECURE: string;
    }
  }
}

export {};
