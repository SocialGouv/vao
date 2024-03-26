import { useUserStore } from "~/stores/user";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger, $fetchBackend } from "#imports";
const log = logger("middleware/is-connected");

export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore();
  log.i("IN");
  if (!userStore.isConnected) {
    log.i("not connected, redirect to login");
    return navigateTo("/connexion");
  } else {
    const url = "/authentication/check-token";
    try {
      await $fetchBackend(url, {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      log.w(error);
      return navigateTo("/connexion");
    }
  }
  log.i("DONE");
});
