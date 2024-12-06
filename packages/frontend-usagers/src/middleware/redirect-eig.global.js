// TODO(eig): To remove when eig is ready

import { logger } from "#imports";
import { defineNuxtRouteMiddleware, navigateTo } from "#app";

const log = logger("middleware/check-role");

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.match("/eig")) {
    return navigateTo("/connexion", { redirectCode: 301 });
  }
  log.i("DONE");
});
