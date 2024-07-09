import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    currentDemande: null,
    total: 0,
    countGlobal: 0,
    countTransmis: 0,
    countEncCours: 0,
    countTransmis8j: 0,
  }),
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
          this.total = demandesWithPagination.total;
          this.countGlobal = demandesWithPagination.count_global;
          this.countTransmis = demandesWithPagination.count_transmis;
          this.countEncCours = demandesWithPagination.count_en_cours;
          this.countTransmis8j = demandesWithPagination.count_transmis_8j;
        }
      } catch (err) {
        log.w("fetchDemandes - DONE with error", err);
        this.demandes = [];
        throw err;
      }
    },
    async setCurrentDemande(id) {
      try {
        const { demande } = await $fetchBackend(`/sejour/admin/${id}`, {
          method: "GET",
          credentials: "include",
        });

        for (const hebergement of demande?.hebergement?.hebergements ?? []) {
          hebergement.nom = (
            await $fetchBackend(
              `/hebergement/admin/${hebergement.hebergementId}`,
              {
                method: "GET",
                credentials: "include",
              },
            )
          ).hebergement.nom;
        }

        if (demande) {
          log.i("fetchDemandes for one id - DONE");
          this.currentDemande = demande;
        } else {
          throw new Error("Demande non trouvée");
        }
      } catch (err) {
        log.w("fetchDemandes for one id - DONE with error", err);
        this.currentDemande = null;
        throw err;
      }
    },
  },
});
