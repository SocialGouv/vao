import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/user");

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    users: [],
    total: 0,
    userSelected: null,
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
    async fetchUsers({ limit, offset, sortBy, sortDirection, search } = {}) {
      log.i("fetchUsers - IN");
      try {
        // Appel du back pour la liste des utilisateurs
        const { usersWithPagination } = await $fetchBackend("/bo-user/list", {
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
        log.d("fetchUsers - réponse", usersWithPagination);
        this.users = usersWithPagination.users;
        this.total = parseInt(usersWithPagination.total);
        log.i("fetchUsers - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.users = [];
        this.total = 0;
        log.w("fetchUsers - Erreur", { error });
      }
    },
    
    async getUser({ search } = {}) {
      console.log("getUser - IN");
      console.log("getUser - IN",search);
      try {
        // Appel du back pour la liste des utilisateurs
        const { user } = await $fetchBackend("/bo-user/user", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            search,
          },
        });
        console.log("getUser - réponse", user);
        this.userSelected = user.user[0];
        log.i("getUser - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.user = null;
        log.w("getUser - Erreur", { error });
      }
    },
  },
});
