import { logger, useUserStore } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";

const log = logger("middleware/check-role");

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const roles = userStore.user?.roles;
  const expectedRoles = typeof to.meta?.roles === "string";
  log.i("IN", { roles, expectedRoles });

  if (
    !expectedRoles ||
    !roles ||
    !Array.isArray(roles) ||
    !roles.some((role) => expectedRoles.includes(role))
  ) {
    log.w(`Au moins un role parmi ${expectedRoles} est attendu`);
    return navigateTo("/connexion");
  }

  log.i("DONE");
});
