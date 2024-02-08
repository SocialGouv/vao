import { defineStore } from "pinia";

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
      try {
        log.i("refreshProfile - IN");
        const config = useRuntimeConfig()
        const response = await $fetch(config.public.backendUrl + "/users/me", {
          credentials: "include",
        });
        const user = response.user;
        this.user = user;
        log.i("refreshProfile - DONE");
      } catch (err) {
        this.user = null;
        log.i("refreshProfile - DONE with error");
      }
    },
  },
});
