import Toaster from "@meforma/vue-toaster";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toaster, {
    position: "top-right",
  });
});
