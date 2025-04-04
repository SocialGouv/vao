import { logger, useUserStore } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { ROLES as userRolesRef } from "../helpers/users";

const log = logger("middleware/check-roles");
const userStore = useUserStore();

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");
  if (!userStore.isConnected) {
    return [];
  }
  if (
    ["/eig", "/eig/"].includes(to.path) &&
    !userStore.user?.roles?.some((role) =>
      [userRolesRef.EIG_LECTURE, userRolesRef.EIG_ECRITURE].includes(role),
    )
  ) {
    return navigateTo("/connexion", { redirectCode: 403 });
  }
  if (
    to.path.match("/eig/liste") &&
    !userStore.user?.roles?.some((role) =>
      [userRolesRef.EIG_LECTURE, userRolesRef.EIG_ECRITURE].includes(role),
    )
  ) {
    return navigateTo("/connexion", { redirectCode: 403 });
  }
});
