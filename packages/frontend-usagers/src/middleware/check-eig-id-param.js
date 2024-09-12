import { logger } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useEigStore } from "~/stores/eig";

const log = logger("middlewares/check-eig-id-param");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN", to.params.eigId);
  const eigStore = useEigStore();
  const eigId = to.params.eigId;
  if (!eigId) {
    await eigStore.setCurrentEig(null);
    return;
  }
  try {
    await eigStore.setCurrentEig(to.params.eigId);
  } catch (e) {
    navigateTo("/eig/liste");
  }

  if (!eigStore.currentEig) {
    log.w("eig not found");
    return navigateTo("/eig/liste");
  }
});
