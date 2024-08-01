import { defineNuxtRouteMiddleware, navigateTo } from "#app";

export default defineNuxtRouteMiddleware((to) => {
  console.log(to.path);
  if (to.path === "/hebergements" || to.path === "/hebergements/") {
    return navigateTo("/hebergements/simple", { redirectCode: 301 });
  }
});
