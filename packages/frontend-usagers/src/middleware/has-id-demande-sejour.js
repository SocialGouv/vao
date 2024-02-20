import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { logger } from "#imports";
import { navigateTo, defineNuxtRouteMiddleware } from "#app";
import { computed } from "vue";

const log = logger("middlewares/has-id-demande-sejour");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", to.params.idDemande);
  const hasId = !!to.params.idDemande;
  const demandeStore = useDemandeSejourStore();
  await demandeStore.fetchDemandes();

  const isIdViewable = computed(() => {
    return !!demandeStore.demandes.find(
      (i) => i.demandeSejourId.toString() === to.params.idDemande,
    );
  });

  if (isNaN(to.params.idDemande)) {
    log.w(`incorrect demandeId : ${to.params.idDemande}`);
    return navigateTo("/");
  }
  if (hasId && !isIdViewable.value) {
    log.w(`demande ${to.params.idDemande} is not linked with current user`);
    return navigateTo("/");
  }
  if (!hasId && to.fullPath !== "/demande-sejour/informations-generales") {
    return navigateTo("/");
  }
  if (hasId) {
    await demandeStore.setDemandeCourante(to.params.idDemande);
  }
});
