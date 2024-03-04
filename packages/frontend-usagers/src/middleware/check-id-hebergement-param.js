import { useHebergementStore } from "~/stores/hebergement";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/check-id-hebergement-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", { to });

  const idHebergement = to.params.idHebergement;
  const hebergementStore = useHebergementStore();

  if (isNaN(idHebergement)) {
    log.w("invalid param");
    return navigateTo("/hebergements");
  }

  await hebergementStore.fetchHebergement(idHebergement);

  if (!hebergementStore.hebergementCourant) {
    log.i("naviagteTo /hebergements");
    return navigateTo("/hebergements");
  }
  log.d("Done");
});
