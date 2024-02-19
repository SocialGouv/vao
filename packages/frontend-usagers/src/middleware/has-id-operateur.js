import { useOperateurStore } from "~/stores/operateur";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/has-id-operateur");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");
  const hasId = !!to.params.idOperateur;
  const operateurStore = useOperateurStore();
  await operateurStore.setMyOperateur();

  if (isNaN(to.params.idOperateur)) {
    log.w("invalid param");
    return navigateTo("/operateur");
  }
  if (operateurStore.operateurCourant.operateurId) {
    if (hasId) {
      if (
        operateurStore.operateurCourant.operateurId.toString() !==
        to.params.idOperateur
      ) {
        log.w(`operator ${to.params.idOperateur} is not owned by current user`);
        log.d("adding correct operateurId to url");
        const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
        return navigateTo(url);
      }
    } else {
      log.d("adding operateurId to url");
      const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
      return navigateTo(url);
    }
  } else if (hasId) {
    return navigateTo("/operateur");
  }
  log.d("Done");
});
