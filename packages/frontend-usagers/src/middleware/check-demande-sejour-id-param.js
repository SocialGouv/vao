import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { logger } from "#imports";
import { navigateTo, defineNuxtRouteMiddleware } from "#app";

const log = logger("middlewares/check-demande-sejour-id-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", to.params.declarationId);
  const hasId = !!to.params.declarationId;
  const demandeStore = useDemandeSejourStore();

  if (isNaN(to.params.declarationId)) {
    log.w(`incorrect declarationId : ${to.params.declarationId}`);
    return navigateTo("/");
  }

  await demandeStore.fetchDemandes();

  const isIdViewable = !!demandeStore.demandes.find(
    (i) => i.declarationId.toString() === to.params.declarationId,
  );

  if (hasId && !isIdViewable) {
    log.w(`demande ${to.params.declarationId} is not linked with current user`);
    return navigateTo("/");
  }

  if (hasId) {
    log.d(`loading current demande`);
    await demandeStore.setDemandeCourante(to.params.declarationId);
    if (!demandeStore.demandeCourante.id) {
      return navigateTo("/");
    }
    log.i("DONE");
  }

  if (!hasId && demandeStore.demandeCourante) {
    demandeStore.resetDemandeCourante();
    log.i("DONE");
  }
});
