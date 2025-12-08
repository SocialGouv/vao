import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";
import type { UserDto } from "@vao/shared-bridge";

const log = logger("stores/user");

interface UserStoreState {
  user: UserDto | null;
  userFO: UserDto | null;
  users: UserDto[];
  usersTerritoire: UserDto[];
  usersFO: UserDto[];
  total: number;
  totalUsersFO: number;
  userSelected: UserDto | null;
  rows: UserDto[];
}

export const useUserStore = defineStore("user", {
  state: (): UserStoreState => ({
    user: null,
    userFO: null,
    users: [],
    usersTerritoire: [],
    usersFO: [],
    total: 0,
    totalUsersFO: 0,
    userSelected: null,
    rows: [],
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
          if (this.user) {
            this.user.serviceCompetent =
              this.user.territoireCode === "FRA"
                ? "NAT"
                : /^\d+$/.test(this.user.territoireCode)
                  ? "DEP"
                  : "REG";
          } else {
            this.user = null;
          }
        }
      } catch (err) {
        log.w("refreshProfile - DONE with error", err);
        this.user = null;
      }
    },
    async fetchUsers(queryParams: any) {
      try {
        const { rows, total } = await $fetchBackend("/bo-user", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: queryParams,
        });
        this.users = rows;
        this.total = parseInt(total);
      } catch (error) {
        // Retour vide en cas d'erreur
        this.rows = [];
        this.total = 0;
        throw error;
      }
    },
    async fetchUsersTerritoire(territoireCode: string) {
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
        return await $fetchBackend("/fo-user/admin/extract/", {
          method: "GET",
          credentials: "include",
        });
      } catch (err) {
        log.w("exportUsersOrganismes - DONE with error", err);
        throw err;
      }
    },
    async fetchUsersFo(params = {}) {
      log.i("fetchUsersFo - IN");
      try {
        const { users, total } = await $fetchBackend(
          "/fo-user/admin/list-to-validate",
          {
            credentials: "include",
            method: "GET",
            params,
          },
        );
        log.d("fetchUsersFo - réponse", { users, total });
        this.usersFO = users;
        this.totalUsersFO = Number.parseInt(total);
        log.i("fetchUsersFo - DONE");
      } catch (error) {
        this.usersFO = [];
        this.totalUsersFO = 0;
        log.w("fetchUsersFo - Erreur", { error });
      }
    },
    async fetchUsersOrganisme({
      limit,
      offset,
      sortBy,
      sortDirection,
      search,
    }: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: string;
      search?: any;
    } = {}) {
      log.i("fetchUsersOrganisme - IN");
      try {
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
        this.totalUsersFO = Number.parseInt(total);
        log.i("fetchUsersOrganisme - DONE");
      } catch (error) {
        this.usersFO = [];
        this.totalUsersFO = 0;
        log.w("fetchUsersOrganisme - Erreur", { error });
      }
    },
    async getUser(id: string) {
      log.i("getUser - IN", { id });
      try {
        const user = await $fetchBackend(`/bo-user/${id}`, {
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
        this.user = null;
        log.w("getUser - Erreur", { error });
      }
    },

    async updateUserFoStatus(userId: string, params: any) {
      log.i("updateUserFoStatut - IN");
      try {
        const response = await $fetchBackend(
          `/fo-user/admin/update-status/${userId}`,
          {
            credentials: "include",
            method: "POST",
            params,
          },
        );
        log.d("updateUserFoStatut - réponse", response);
        log.i("updateUserFoStatut - DONE");
      } catch (error) {
        log.w("updateUserFoStatut - Erreur", { error });
      }
    },
  },
});
