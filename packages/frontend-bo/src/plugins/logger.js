import { defineNuxtPlugin } from "#app";
import { logger } from "#imports";

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      logger,
    },
  };
});
