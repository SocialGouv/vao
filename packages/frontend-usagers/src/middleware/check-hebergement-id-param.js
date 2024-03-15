import { useHebergementStore } from "~/stores/hebergement";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/check-id-demande-sejour");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", { to });

  const hebergementId = to.params.hebergementId;
  const hebergementStore = useHebergementStore();

  if (isNaN(hebergementId)) {
    log.w("invalid param");
    return navigateTo("/hebergements");
  }

  await hebergementStore.fetchHebergement(hebergementId);

  if (!hebergementStore.hebergementCourant) {
    log.i("naviagteTo /hebergements");
    return navigateTo("/hebergements");
  }
  log.d("Done");
});
