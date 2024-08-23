import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(async ({ $config }) => {
  if (import.meta.client) {
    try {
      const response = await fetch("/config.json");
      const config = await response.json();
      $config.public = { ...$config.public, ...config };
    } catch (error) {
      console.error("Dynamic config unavailable (local)", error);
    }
  }
});
