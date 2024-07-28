import * as Sentry from "@sentry/vue";
import { defineNuxtPlugin } from "#app";
import { useRuntimeConfig } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  const {
    public: { sentry, environment, backendUrl },
  } = useRuntimeConfig();

  if (sentry.enabled) {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: sentry.dsn,
      environment: environment,
      integrations: [
        Sentry.browserTracingIntegration({ router: nuxtApp.$router }),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      tracesSampleRate: 1.0,
      tracePropagationTargets: ["localhost", backendUrl],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
});
