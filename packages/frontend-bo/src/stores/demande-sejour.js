import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    total: 0,
  }),
  getters: {
    getById: (state) => (stateId) =>
      state.demandes.find((d) => d.demandeSejourId === parseInt(stateId)),
  },
  actions: {
    async fetchDemandes({ limit, offset, sortBy, sortDirection, search } = {}) {
      log.i("fetchDemandes - IN");
      try {
        const { demandesWithPagination } = await $fetchBackend(
          "/sejour/admin",
          {
            method: "GET",
            credentials: "include",
            params: {
              limit,
              offset,
              sortBy,
              sortDirection,
              search,
            },
          },
        );

        if (demandesWithPagination) {
          log.i("fetchDemandes - DONE");
          this.demandes = demandesWithPagination.demandes_sejour;
          this.total = parseInt(demandesWithPagination.total);
        }
      } catch (err) {
        log.w("fetchDemandes - DONE with error", err);
        this.demandes = [];
      }
    },
  },
});
