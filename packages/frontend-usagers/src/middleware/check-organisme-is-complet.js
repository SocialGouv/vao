import { useOrganismeStore } from "~/stores/organisme";
import { logger } from "#imports";
import { navigateTo, defineNuxtRouteMiddleware } from "#app";

const log = logger("middlewares/check-organisme-is-complet");

export default defineNuxtRouteMiddleware(async () => {
  log.i("IN");
  const organismeStore = useOrganismeStore();
  await organismeStore.setMyOrganisme();

  if (
    !organismeStore.organismeCourant ||
    !organismeStore.organismeCourant.complet
  ) {
    log.w("current organisme is not defined or incomplete, back to home");
    return navigateTo("/");
  }
  log.i("DONE");
});
