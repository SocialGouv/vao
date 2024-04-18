import * as Sentry from "@sentry/vue";
import { defineNuxtPlugin } from "#app";
import { useRuntimeConfig } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  const {
    public: { sentry, environment },
  } = useRuntimeConfig();

  if (sentry.enabled) {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: sentry.dsn,
      environment: environment,
      integrations: [
        Sentry.browserTracingIntegration({ router: nuxtApp.$router }),
      ],
      tracesSampleRate: 1.0,
    });
  }
});
