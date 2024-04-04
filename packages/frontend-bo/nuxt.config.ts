// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
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
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      backendUrl: "",
    },
  },
  srcDir: "src",
  ssr: false,
});
