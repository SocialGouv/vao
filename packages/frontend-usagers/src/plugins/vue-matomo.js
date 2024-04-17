import VueMatomo from "vue-matomo";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const {
    public: { matomo },
  } = useRuntimeConfig();
  if (matomo.enabled) {
    nuxtApp.vueApp.use(VueMatomo, {
      router: nuxtApp.$router,
      host: matomo.host,
      siteId: matomo.siteId,
      enableLinkTracking: true,
      trackInitialView: true,
      disableCookies: true,
    });
  }
});
