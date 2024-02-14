import { defineStore } from "pinia";
import { useRuntimeConfig, useFetch } from "#app";
import { logger } from "#imports";

const log = logger("stores/user");

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
  }),
  getters: {
    isConnected: (state) => state.user && state.user !== null,
  },
  actions: {
    async refreshProfile() {
      log.i("refreshProfile - IN");
      const config = useRuntimeConfig();
      const { data, error } = await useFetch(
        config.public.backendUrl + "/users/me",
        {
          credentials: "include",
        },
      );
      if (data.value) {
        log.i("refreshProfile - DONE");
        this.user = data.value.user;
      }
      if (error.value) {
        log.w("refreshProfile - DONE with error", error.value);
        this.user = null;
      }
    },
  },
});
