import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { useAgrementStore } from "~/stores/agrement";
import { useOrganismeStore } from "~/stores/organisme";

const log = logger("middlewares/load-agrement-context");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");

  const agrementStore = useAgrementStore();
  const organismeStore = useOrganismeStore();
  try {
    if (!organismeStore.organismeCourant) {
      await organismeStore.setMyOrganisme();
    }

    if (!agrementStore.agrementCourant) {
      const organismeCourant = organismeStore.organismeCourant;
      if (organismeCourant) {
        await agrementStore.getCurrent(organismeCourant);
      }
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

    if (!organismeStore.isPorteurAgrement) {
      log.w(
        "Organisme non porteur de l'agrement, renouvellement non autorisé, redirect home",
        { organismeId: organismeStore.organismeCourant?.id },
      );
      return navigateTo("/");
    }

    if (!agrementStore.agrementEnTraitement) {
      await agrementStore.getEnRenouvellement(organismeStore.organismeCourant);
    }

    log.i("DONE without route agrementId");
  } catch (err: unknown) {
    log.w("FAIL", err);
    return navigateTo("/");
  }
});
