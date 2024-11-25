import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";

export default defineNuxtRouteMiddleware(async (to) => {
  const hasId = !!to.params.declarationId;
  const demandeStore = useDemandeSejourStore();
  if (hasId && isNaN(to.params.declarationId)) {
    return navigateTo("/");
  }

  if (hasId) {
    try {
      await demandeStore.setDemandeCourante(to.params.declarationId);
    } catch (error) {
      navigateTo("/");
      throw error;
    }
  } else {
    await demandeStore.resetDemandeCourante();
  }
});
