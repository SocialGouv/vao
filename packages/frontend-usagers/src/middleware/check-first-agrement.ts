import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { loadAgrementDetectionState } from "~/composables/useAgrementDetection";
import { useOrganismeStore } from "~/stores/organisme";

const log = logger("middlewares/check-first-agrement");

export default defineNuxtRouteMiddleware(async () => {
  log.i("IN");
  const organismeStore = useOrganismeStore();
  try {
    const { hasAnyAgrement } = await loadAgrementDetectionState();
    const organismeComplet = Boolean(organismeStore.organismeCourant?.complet);

    if (!hasAnyAgrement && organismeComplet) {
      log.i("DONE - aucun agrement detecte, redirect /agrement/bienvenue");
      return navigateTo("/agrement/bienvenue");
    }
    log.i("DONE - reste sur l'accueil");
  } catch (err: unknown) {
    log.w("FAIL", err);
  }
});
