import { defineNuxtRouteMiddleware, navigateTo } from "#app";

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === "/hebergements" || to.path === "/hebergements/") {
    return navigateTo("/hebergements/simple", { redirectCode: 301 });
  }
});
