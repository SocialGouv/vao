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
    return navigateTo("/");
  }
  if (hasId && operateurStore.operateurCourant.operateurId) {
    if (
      operateurStore.operateurCourant.operateurId.toString() !==
      to.params.idOperateur
    ) {
      log.w(`operator ${to.params.idOperateur} is not owned by current user`);
      log.d("adding correct operateurId to url");
      const url = `${to.fullPath}${operateurStore.operateurCourant.operateurId}`;
      return navigateTo(url.replace("//", "/"));
    }
    log.d("nothing to do");
  }
  if (!hasId && operateurStore.operateurCourant.operateurId) {
    log.d("adding operateurId to url");
    const formatedUrl =
      to.fullPath.slice(-1) === "/" ? to.fullPath : to.fullPath + "/";
    const url = `${formatedUrl}${operateurStore.operateurCourant.operateurId}`;
    return navigateTo(url.replace("//", "/"));
  }
  if (!operateurStore.operateurCourant.operateurId) {
    if (to.fullPath !== "/operateur/renseignements-generaux") {
      log.w("no operator linked to current user, sending back to beginning");
      return navigateTo("/operateur/renseignements-generaux");
    }
  }
});
