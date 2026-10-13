import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { useHebergementStore } from "~/stores/hebergement";
import { useOrganismeStore } from "~/stores/organisme";

const log = logger("middlewares/load-hebergement-context");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");
  const hebergementStore = useHebergementStore();
  const organismeStore = useOrganismeStore();
  try {
    if (!organismeStore.organismeCourant) {
      await organismeStore.setMyOrganisme();
    }

    const { siteId: siteIdParam } = to.params;

    if (siteIdParam) {
      log.i("On charge le site d'hébergement avec l'ID", { siteIdParam });
      const isLoaded = await hebergementStore.getSite(String(siteIdParam));

      if (!isLoaded) {
        log.w("Hebergement site not found, redirect list", { siteIdParam });
        return navigateTo("/hebergements/liste");
      }

      log.i("DONE with route siteId", { siteIdParam });
      return;
    }

    log.i("DONE without route siteId");
  } catch (err: unknown) {
    log.w("FAIL", err);
    return navigateTo("/hebergements/liste");
  }
});
