import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { useOrganismeStore } from "~/stores/organisme";
import { logger } from "#imports";
import { navigateTo, defineNuxtRouteMiddleware } from "#app";

const log = logger("middlewares/check-id-demande-sejour-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", to.params.idDemande);
  const hasId = !!to.params.idDemande;
  const demandeStore = useDemandeSejourStore();
  const organismeStore = useOrganismeStore();

  if (isNaN(to.params.idDemande)) {
    log.w(`incorrect demandeId : ${to.params.idDemande}`);
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
    (i) => i.demandeSejourId.toString() === to.params.idDemande,
  );

  if (hasId && !isIdViewable) {
    log.w(`demande ${to.params.idDemande} is not linked with current user`);
    return navigateTo("/");
  }

  if (hasId) {
    log.d(`loading current demande`);
    await demandeStore.setDemandeCourante(to.params.idDemande);
  }

  if (!hasId && demandeStore.demandeCourante) {
    demandeStore.resetDemandeCourante();
  }
});
