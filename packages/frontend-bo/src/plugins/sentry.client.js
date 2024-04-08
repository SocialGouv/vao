import * as Sentry from "@sentry/vue";
import { defineNuxtPlugin } from "#app";
import { useRouter, useRuntimeConfig } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const {
    public: { sentry, appVersion, environment },
  } = useRuntimeConfig();

  if (sentry.enabled) {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: sentry.dsn,
      environment: environment,
      release: appVersion,
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
    });
  }
});
