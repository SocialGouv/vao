import { useOperateurStore } from "~/stores/operateur";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/check-id-operateur-param");

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
    log.w("opérateur non accessible");
    return navigateTo("/operateur");
  }

  if (!to.params.idOperateur) {
    log.i("redirection vers route complète");
    const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
    return navigateTo({ path: url, hash: to.hash });
  }

  if (
    operateurStore.operateurCourant.operateurId.toString() !==
    to.params.idOperateur
  ) {
    log.w(`operator ${to.params.idOperateur} is not owned by current user`);
    const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
    return navigateTo(url);
  }

  log.d("Done");
});
