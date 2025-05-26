import { logger } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useEigStore } from "~/stores/eig";

const log = logger("middlewares/check-eig-id-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", to.fullPath, to.params.eigId);
  const eigStore = useEigStore();
  const eigId = to.params.eigId;
  // TODO à prioris eigId est null dans ce cas, donc l'appel à setCurrentEig reste identique.
  // A revoir à l'occasion
  if (!eigId) {
    await eigStore.setCurrentEig(null);
    return;
  }

  try {
    await eigStore.setCurrentEig(eigId);
  } catch (e) {
    if (to.path !== "/eig/liste") {
      return navigateTo("/eig/liste");
    }
  }

  if (!eigStore.currentEig && to.path !== "/eig/liste") {
    log.w("eig not found, redirecting");
    return navigateTo("/eig/liste");
  }
});
