// https://nuxt.com/docs/api/configuration/nuxt-config
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
    "nuxt-security",
    "@pinia/nuxt",
    "nuxt3-leaflet",
    "@socialgouv/dsfr-toaster-nuxt-module",
  ],
  runtimeConfig: {
    public: {
      appVersion: undefined,
      backendUrl: undefined,
      environment: undefined,
      matomo: {
        enabled: undefined,
        host: undefined,
        siteId: undefined,
      },
      sentry: {
        dsn: undefined,
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
  },
  srcDir: "src",
  ssr: false,
});
