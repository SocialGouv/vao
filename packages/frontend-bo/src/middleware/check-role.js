import { logger, useUserStore } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";

const log = logger("middleware/check-role");

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const roles = userStore.user?.roles;
  const role = to.meta?.role;
  log.i("IN", { roles, role });
  if (!role || !roles || !Array.isArray(roles) || !roles.includes(role)) {
    log.w(`role ${role} manquant`);
    return navigateTo("/connexion");
  }

  log.i("DONE");
});
