import { useOperateurStore } from "~/stores/operateur";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/has-id-operateur");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", { to });

  if (to.params.idOperateur && isNaN(to.params.idOperateur)) {
    log.w("invalid param");
    return navigateTo("/operateur");
  }

  const operateurStore = useOperateurStore();
  await operateurStore.setMyOperateur();

  if (!to.params.idOperateur && !operateurStore.operateurCourant) {
    log.d("Création organisme");
    return;
  }
  if (to.params.idOperateur && !operateurStore.operateurCourant) {
    return navigateTo("/operateur");
  }

  if (!to.params.idOperateur) {
    const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
    return navigateTo({ path: url, hash: to.hash });
  }

  if (
    operateurStore.operateurCourant.operateurId.toString() !==
    to.params.idOperateur
  ) {
    log.w(`operator ${to.params.idOperateur} is not owned by current user`);
    log.d("adding correct operateurId to url");
    const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
    return navigateTo(url);
  }

  log.d("Done");
});
