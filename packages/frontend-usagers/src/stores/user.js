import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/user");

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    apiToken: null,
    users: [],
    total: 0,
    userSelected: null,
  }),
  getters: {
    isConnected: (state) => !!state.user,
  },
  actions: {
    async getUserSelected(userId) {
      log.i("refreshProfile - IN");
      try {
        const { user } = await $fetchBackend(`/fo-user/get-one/${userId}`, {
          credentials: "include",
        });
        if (user) {
          log.i("refreshProfile - DONE");
          this.userSelected = user;
        }
      } catch (err) {
        log.w("refreshProfile - DONE with error", err);
        this.userSelected = null;
      }
    },
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
    async fetchUsersOrganisme(params = {}) {
      log.i("fetchUsersOrganisme - IN");
      try {
        const { users, total } = await $fetchBackend(
          "/fo-user/get-by-organisme",
          {
            credentials: "include",
            method: "GET",
            params,
          },
        );
        log.d("fetchUsersOrganisme - réponse", { users, total });
        this.users = users;
        this.total = parseInt(total);
        log.i("fetchUsersOrganisme - DONE");
      } catch (error) {
        this.users = [];
        this.total = 0;
        log.w("fetchUsersOrganisme - Erreur", { error });
      }
    },
  },
});
