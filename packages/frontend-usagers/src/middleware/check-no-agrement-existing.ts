import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { loadAgrementDetectionState } from "~/composables/useAgrementDetection";

const log = logger("middlewares/check-no-agrement-existing");

export default defineNuxtRouteMiddleware(async () => {
  log.i("IN");
  try {
    const { hasAnyAgrement } = await loadAgrementDetectionState();

    if (hasAnyAgrement) {
      log.w("Un agrement existe deja, redirect vers l'accueil");
      return navigateTo("/");
    }
    log.i("DONE");
  } catch (err: unknown) {
    log.w("FAIL", err);
    return navigateTo("/");
  }
});
