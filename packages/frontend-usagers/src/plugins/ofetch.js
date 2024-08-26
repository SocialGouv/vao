import { ofetch } from "ofetch";
import { defineNuxtPlugin, navigateTo } from "#app";
import { useToaster } from "#imports";

export default defineNuxtPlugin(() => {
  globalThis.$fetch = ofetch.create({
    async onResponseError({ response }) {
      if (response.status === 401) {
        await navigateTo("/connexion/");
      }
      if (response.status === 403) {
        const toaster = useToaster();
        return toaster.error({
          titleTag: "h2",
          description: "Vous n'êtes pas autorisé à réaliser cette action",
        });
      }
    },
  });
});
