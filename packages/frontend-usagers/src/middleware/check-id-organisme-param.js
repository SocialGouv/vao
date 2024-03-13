import { useOrganismeStore } from "~/stores/organisme";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/check-id-organisme-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", { to });
  if (to.params.idOrganisme && isNaN(to.params.idOrganisme)) {
    log.w("invalid param");
    return navigateTo("/organisme");
  }

  const organismeStore = useOrganismeStore();
  await organismeStore.setMyOrganisme();

  if (!to.params.idOrganisme && !organismeStore.organismeCourant) {
    log.d("Création organisme");
    return;
  }

  if (to.params.idOrganisme && !organismeStore.organismeCourant) {
    log.w("organisme non accessible");
    return navigateTo("/organisme");
  }

  if (!to.params.idOrganisme) {
    log.i("redirection vers route complète");
    const url = `/organisme/${organismeStore.organismeCourant.organismeId}`;
    return navigateTo({ path: url, hash: to.hash });
  }

  if (
    organismeStore.organismeCourant.organismeId.toString() !==
    to.params.idOrganisme
  ) {
    log.w(`organisme ${to.params.idOrganisme} is not owned by current user`);
    const url = `/organisme/${organismeStore.organismeCourant.organismeId}`;
    return navigateTo(url);
  }

  log.d("Done");
});
