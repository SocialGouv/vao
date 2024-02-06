import { ofetch } from "ofetch";

export default defineNuxtPlugin((_nuxtApp) => {
  globalThis.$fetch = ofetch.create({
    async onResponseError({ request, response, options }) {
      if (response.status === 403) {
        await navigateTo("/connexion/login");
      }
    },
  });
});
