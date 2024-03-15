import { useOrganismeStore } from "~/stores/organisme";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/check-organisme-id-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", { to });
  if (to.params.organismeId && isNaN(to.params.organismeId)) {
    log.w("invalid param");
    return navigateTo("/organisme");
  }

  const organismeStore = useOrganismeStore();
  await organismeStore.setMyOrganisme();

  if (!to.params.organismeId && !organismeStore.organismeCourant) {
    log.d("Création organisme");
    return;
  }

  if (to.params.organismeId && !organismeStore.organismeCourant) {
    log.w("organisme non accessible");
    return navigateTo("/organisme");
  }

  if (!to.params.organismeId) {
    log.i("redirection vers route complète");
    const url = `/organisme/${organismeStore.organismeCourant.organismeId}`;
    return navigateTo({ path: url, hash: to.hash });
  }

  if (
    organismeStore.organismeCourant.organismeId.toString() !==
    to.params.organismeId
  ) {
    log.w(`organisme ${to.params.organismeId} is not owned by current user`);
    const url = `/organisme/${organismeStore.organismeCourant.organismeId}`;
    return navigateTo(url);
  }

  log.d("Done");
});
