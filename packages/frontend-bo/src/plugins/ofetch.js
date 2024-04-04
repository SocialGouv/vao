import { ofetch } from "ofetch";
import { defineNuxtPlugin, navigateTo } from "#app";

export default defineNuxtPlugin(() => {
  globalThis.$fetch = ofetch.create({
    async onResponseError({ response }) {
      if (response.status === 403) {
        await navigateTo("/connexion");
      }
    },
  });
});
