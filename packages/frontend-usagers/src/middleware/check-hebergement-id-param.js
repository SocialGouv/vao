import { useHebergementStore } from "~/stores/hebergement";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/check-hebergement-id-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", { to });

  const hebergementStore = useHebergementStore();
  const hebergementId = to.params.hebergementId;

  if (isNaN(hebergementId)) {
    log.w("invalid param");
    return navigateTo("/hebergements/liste");
  }

  if (!hebergementId) {
    log.i("DONE");
    return;
  }

  await hebergementStore.fetchById(hebergementId);

  if (!hebergementStore.hebergementCourant) {
    log.w("hebergement not found, navigateTo /hebergements/liste");
    return navigateTo("/hebergements/liste");
  }
  log.i("DONE");
});
