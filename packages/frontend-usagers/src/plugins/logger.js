import logger from "../utils/logger";
export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      logger,
    },
  };
});
