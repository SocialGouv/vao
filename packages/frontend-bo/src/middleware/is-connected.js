import { useUserStore } from "~/stores/user";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";

const log = logger("middlewares/is-connected");

export default defineNuxtRouteMiddleware(() => {
  const userStore = useUserStore();
  log.i("IN");
  if (!userStore.isConnected) {
    log.i("not connected, redirect to login");
    return navigateTo("/connexion");
  }
  log.i("DONE");
});