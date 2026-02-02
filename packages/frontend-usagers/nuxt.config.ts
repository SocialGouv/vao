// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      title: "VAO - Vacances Adaptées Organisées",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
  css: [
    "@gouvfr/dsfr/dist/dsfr.min.css",
    "@gouvminint/vue-dsfr/styles",
    "@gouvfr/dsfr/dist/utility/icons/icons.min.css",
    "@/assets/css/main.css",
  ],
  devtools: { enabled: false },
  modules: [
    "@pinia/nuxt",
    "@socialgouv/dsfr-toaster-nuxt-module",
    "nuxt-maplibre",
    "nuxt-security",
    "vue-dsfr-nuxt-module",
    "@samk-dev/nuxt-vcalendar",
  ],
  typescript: {
    typeCheck: true,
    tsConfig: {
      exclude: [
        resolve(__dirname, "../shared-bridge/**"),
        resolve(__dirname, "../shared-ui/**"),
      ],
    },
  },
  alias: {
    "@vao/shared-bridge": resolve(__dirname, "../shared-bridge/src"),
    "@vao/shared-ui": resolve(__dirname, "../shared-ui/src"),
  },
  runtimeConfig: {
    public: {
      appVersion: undefined,
      backendUrl: undefined,
      environment: undefined,
      apiMapTiler: undefined,
      matomo: {
        enabled: undefined,
        host: undefined,
        siteId: undefined,
      },
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
    optimizeDeps: {
      include: ["maplibre-gl"],
    },
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
  devServer: {
    port: 8000,
  },
});
