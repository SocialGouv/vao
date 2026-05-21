import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { useAgrementStore } from "~/stores/agrement";

const log = logger("middlewares/load-agrement-context");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");

  const agrementStore = useAgrementStore();

  try {
    if (!agrementStore.agrementCourant) {
      await agrementStore.getCurrent();
    }

    const { agrementId: agrementIdParam } = to.params;

    if (agrementIdParam && /^\d+$/.test(String(agrementIdParam))) {
      const agrementId = Number(agrementIdParam);
      const currentEnTraitementId =
        agrementStore.agrementEnTraitement?.id ?? null;

      if (currentEnTraitementId !== agrementId) {
        const isLoaded = await agrementStore.getEnTraitementById(agrementId);

        if (!isLoaded) {
          log.w("Agrement not found, redirect home", { agrementId });
          return navigateTo("/");
        }
      }

      log.i("DONE with route agrementId", { agrementId });
      return;
    }

    if (!agrementStore.agrementEnTraitement) {
      await agrementStore.getEnRenouvellement();
    }

    log.i("DONE without route agrementId");
  } catch (err: unknown) {
    log.w("FAIL", err);
    return navigateTo("/");
  }
});
