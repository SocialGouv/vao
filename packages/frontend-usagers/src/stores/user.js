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
      await $fetchBackend("/users/me", {
        method: "PATCH",
        credentials: "include",
        body: {
          ...params,
        },
      });
      this.refreshProfile();
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
        this.total = total;
        log.i("fetchUsersOrganisme - DONE");
      } catch (error) {
        this.users = [];
        this.total = 0;
        log.w("fetchUsersOrganisme - Erreur", { error });
      }
    },
    async updateRole({ roles, userId }) {
      log.i("updateRole - IN");
      try {
        const response = await $fetchBackend(`/fo-user/roles/${userId}`, {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            roles: [roles],
          },
        });
        return response;
      } catch (error) {
        log.w("updateRole - Erreur", { error });
        throw error;
      }
    },
    async handleUserStatus(action, userId, params) {
      log.i(`${action} - IN`);
      try {
        const response = await $fetchBackend(`/fo-user/${action}/${userId}`, {
          credentials: "include",
          method: "POST",
          params,
        });
        log.d(`${action} - réponse`, response);
        log.i(`${action} - DONE`);
      } catch (error) {
        log.w(`${action} - Erreur`, { error });
        throw error;
      }
    },

    async updateUserStatus(userId, params) {
      return this.handleUserStatus("update-status", userId, params);
    },

    async changeUserStatus(userId, params) {
      return this.handleUserStatus("change-status", userId, params);
    },
  },
});
