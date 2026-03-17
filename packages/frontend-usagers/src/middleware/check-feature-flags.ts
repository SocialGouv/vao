import { logger, useUserStore } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { FeatureFlagName } from "@vao/shared-bridge";

const log = logger("middleware/check-feature-flag");
const userStore = useUserStore();

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");
  if (!userStore.isConnected) {
    return;
  }
  if (
    ["/agrement", "/agrement/", "/mon-agrement", "/mon-agrement/"].includes(
      to.path,
    ) &&
    !userStore.user?.featureFlags?.[FeatureFlagName.RENOUVELLEMENT_AGREMENT]
  ) {
    return navigateTo("/connexion", { redirectCode: 403 });
  }
});
