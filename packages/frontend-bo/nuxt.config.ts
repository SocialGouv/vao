// https://nuxt.com/docs/api/configuration/nuxt-config

import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      title: "VAO Instructeurs - Vacances Adaptées Organisées",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },

  css: [
    "@gouvfr/dsfr/dist/dsfr.min.css",
    "@gouvminint/vue-dsfr/styles",
    "@gouvfr/dsfr/dist/utility/icons/icons.min.css",
    "@/assets/css/main.css",
  ],

  modules: [
    "@pinia/nuxt",
    "@socialgouv/dsfr-toaster-nuxt-module",
    "nuxt-maplibre",
    "nuxt-security",
    "vue-dsfr-nuxt-module",
    "@samk-dev/nuxt-vcalendar",
  ],

  runtimeConfig: {
    public: {
      appVersion: undefined,
      backendUrl: undefined,
      apiMapTiler: undefined,
      environment: undefined,
      matomo: {
        enabled: undefined,
        host: undefined,
        siteId: undefined,
      },
      matomoSiteId: undefined,
      sentry: {
        dsn: undefined,
        release: undefined,
        enabled: undefined,
      },
    },
  },

  security: {
    headers: {
      crossOriginEmbedderPolicy: "unsafe-none",
      contentSecurityPolicy: {
        "img-src": ["'self'", "*.openstreetmap.org", "data:"],
        "script-src": [
          "'self'",
          "https:",
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'unsafe-eval'",
          "'nonce-{{nonce}}'",
        ],
      },
    },
    // required to get non empty sourcemaps https://github.com/Baroshem/nuxt-security/issues/501
    removeLoggers: false,
  },

  srcDir: "src",
  ssr: false,

  sourcemap: {
    client: true,
  },

  vite: {
    plugins: [
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        url: process.env.SENTRY_URL,
        release: { name: process.env.SENTRY_RELEASE },
      }),
    ],
  },

  compatibilityDate: "2025-03-31",
});