// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "VAO - Vacances Adaptées Organisées",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
      script: [
        {
          src: "/js/jquery.min.js",
          type: "text/javascript",
        },
        {
          src: "/js/jquery-captcha.min.js",
          type: "text/javascript",
        },
      ],
    },
  },
  css: [
    "@gouvfr/dsfr/dist/dsfr.min.css",
    "@gouvminint/vue-dsfr/styles",
    "@gouvfr/dsfr/dist/utility/icons/icons.min.css",
    "@/assets/css/main.css",
  ],
  modules: ["@pinia/nuxt", "nuxt3-leaflet"],
  runtimeConfig: {
    public: {
      backendUrl: "",
    },
  },
  srcDir: "src",
  ssr: false,
});
