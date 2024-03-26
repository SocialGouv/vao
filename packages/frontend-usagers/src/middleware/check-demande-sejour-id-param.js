import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { useOrganismeStore } from "~/stores/organisme";
import { logger } from "#imports";
import { navigateTo, defineNuxtRouteMiddleware } from "#app";

const log = logger("middlewares/check-demande-sejour-id-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", to.params.demandeId);
  const hasId = !!to.params.demandeId;
  const demandeStore = useDemandeSejourStore();
  const organismeStore = useOrganismeStore();

  if (isNaN(to.params.demandeId)) {
    log.w(`incorrect demandeId : ${to.params.demandeId}`);
    return navigateTo("/");
  }

  await organismeStore.setMyOrganisme();
  await demandeStore.fetchDemandes();

  if (
    !organismeStore.organismeCourant ||
    !organismeStore.organismeCourant.complet
  ) {
    log.w("current organisme is not defined or incomplete, back to home");
    return navigateTo("/");
  }

  const isIdViewable = !!demandeStore.demandes.find(
    (i) => i.demandeSejourId.toString() === to.params.demandeId,
  );

  if (hasId && !isIdViewable) {
    log.w(`demande ${to.params.demandeId} is not linked with current user`);
    return navigateTo("/");
  }

  if (hasId) {
    log.d(`loading current demande`);
    await demandeStore.setDemandeCourante(to.params.demandeId);
    log.i("DONE");
  }

  if (!hasId && demandeStore.demandeCourante) {
    demandeStore.resetDemandeCourante();
    log.i("DONE");
  }
});
