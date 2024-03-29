import { defineNuxtPlugin } from "#app";
import { useUserStore } from "~/stores/user";
import { logger } from "#imports";

const log = logger("plugins/init-user");

export default defineNuxtPlugin(async () => {
  log.i("IN");
  const userStore = useUserStore();
  await userStore.refreshProfile();
  log.i("DONE");
});
