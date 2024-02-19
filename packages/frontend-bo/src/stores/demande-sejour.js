import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
  }),
  actions: {
    async fetchDemandes() {
      log.i("fetchDemandes - IN");
      try {
        const { demandes } = await $fetchBackend("/sejour/admin", {
          method: "GET",
          credentials: "include",
        });
        if (demandes) {
          log.i("fetchDemandes - DONE");
          this.demandes = demandes;
        }
      } catch (err) {
        log.w("fetchDemandes - DONE with error", err);
        this.demandes = [];
      }
    },
  },
});
