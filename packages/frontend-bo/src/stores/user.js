import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/user");

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    userFO: null,
    users: [],
    usersTerritoire: [],
    usersFO: [],
    total: 0,
    totalUsersFO: 0,
    userSelected: null,
  }),
  getters: {
    isConnected: (state) => !!state.user,
  },
  actions: {
    async refreshProfile() {
      log.i("refreshProfile - IN");
      try {
        const { user } = await $fetchBackend("/bo-user/me", {
          credentials: "include",
        });
        if (user) {
          log.i("refreshProfile - DONE");
          this.user = user;
          this.user.serviceCompetent =
            this.user.territoireCode === "FRA"
              ? "NAT"
              : /^\d+$/.test(this.user.territoireCode)
                ? "DEP"
                : "REG";
        }
      } catch (err) {
        log.w("refreshProfile - DONE with error", err);
        this.user = null;
      }
    },
    async fetchUsers({ limit, offset, sortBy, sortDirection, search } = {}) {
      log.i("fetchUsers - IN");
      try {
        // Appel du back pour la liste des utilisateurs
        const { users, total } = await $fetchBackend("/bo-user", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            limit,
            offset,
            sortBy,
            sortDirection,
            search,
          },
        });
        log.d("fetchUsers - réponse", { users, total });
        this.users = users;
        this.total = parseInt(total);
        log.i("fetchUsers - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.users = [];
        this.total = 0;
        log.w("fetchUsers - Erreur", { error });
      }
    },
    async fetchUsersTerritoire(territoireCode) {
      log.i("fetchUsers - IN");

      try {
        // Appel du back pour la liste des utilisateurs
        const { users, total } = await $fetchBackend(
          `/bo-user/territoires/${territoireCode}`,
          {
            credentials: "include",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        log.d("fetchUsers - réponse", { users, total });
        this.users = users;
        this.total = total;
        log.i("fetchUsers - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.users = [];
        this.total = 0;
        log.w("fetchUsers - Erreur", { error });
        throw error;
      }
    },
    async exportUsers() {
      log.i("exportUsers - IN");
      try {
        const response = await $fetchBackend(`/bo-user/extract`, {
          method: "GET",
          credentials: "include",
        });
        log.i("exportUsers - DONE");
        return response;
      } catch (err) {
        log.w("exportUsers - DONE with error", err);
        throw err;
      }
    },
    async exportUsersOrganismes() {
      log.i("exportUsersOrganismes - IN");
      try {
        return await $fetchBackend(`/fo-user/admin/extract/`, {
          method: "GET",
          credentials: "include",
        });
      } catch (err) {
        log.w("exportUsersOrganismes - DONE with error", err);
        throw err;
      }
    },

    async fetchUsersOrganisme({
      limit,
      offset,
      sortBy,
      sortDirection,
      search,
    } = {}) {
      log.i("fetchUsersOrganisme - IN");
      try {
        // Appel du back pour la liste des utilisateurs
        const { users, total } = await $fetchBackend("/fo-user/admin/list", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            limit,
            offset,
            sortBy,
            sortDirection,
            search,
          },
        });
        log.d("fetchUsersOrganisme - réponse", { users, total });
        this.usersFO = users;
        this.totalUsersFO = parseInt(total);
        log.i("fetchUsersOrganisme - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.usersFO = [];
        this.totalUsersFO = 0;
        log.w("fetchUsersOrganisme - Erreur", { error });
      }
    },

    async getUser(id) {
      log.i("getUser - IN", { id });
      try {
        const user = await $fetchBackend("/bo-user/" + id, {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        log.d("getUser", { user });
        this.userSelected = user;
        log.i("getUser - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.user = null;
        log.w("getUser - Erreur", { error });
      }
    },
  },
});
