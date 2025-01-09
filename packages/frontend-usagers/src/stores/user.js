import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/user");

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    apiToken: null,
  }),
  getters: {
    isConnected: (state) => !!state.user,
  },
  actions: {
    async refreshProfile() {
      log.i("refreshProfile - IN");
      try {
        const { user } = await $fetchBackend("/users/me", {
          credentials: "include",
        });
        if (user) {
          log.i("refreshProfile - DONE");
          this.user = user;
        }
      } catch (err) {
        log.w("refreshProfile - DONE with error", err);
        this.user = null;
      }
    },
    async patchProfile(params) {
      const { user } = await $fetchBackend("/users/me", {
        method: "PATCH",
        credentials: "include",
        body: {
          ...params,
        },
      });
      this.user = user;
    },
    async getApiToken() {
      const response = await $fetchBackend("/users/api-token", {
        method: "GET",
        credentials: "include",
      });
      this.apiToken = response;
    },
    async generateApiToken() {
      const response = await $fetchBackend("/users/generate-api-token", {
        method: "POST",
        credentials: "include",
      });
      this.apiToken = response;
    },
  },
});
