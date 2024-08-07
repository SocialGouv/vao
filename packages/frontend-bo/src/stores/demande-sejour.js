import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    messages: [],
    currentDemande: null,
    total: 0,
    countGlobal: 0,
    countTransmis: 0,
    countEncCours: 0,
    countTransmis8j: 0,
    hebergements: [],
    hebergementsCount: 0,
    isGetHebergementsLoading: false,
    hebergement: null,
    isGetHebergementLoading: false,
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
    async exportSejours() {
      log.i("exportSejours - IN");
      try {
        const response = await $fetchBackend(`/sejour/admin/extract`, {
          method: "GET",
          credentials: "include",
        });
        log.i("exportSejours - DONE");
        return response;
      } catch (err) {
        log.w("exportSejours - DONE with error", err);
        throw err;
      }
    },

    async fetchMessages(declarationId) {
      try {
        const messages = await $fetchBackend(
          `/message/admin/${declarationId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (messages) {
          log.i("fetchMessages - DONE");
          this.messages = messages;
        } else {
          throw new Error("erreur sur la récupération des messages");
        }
      } catch (err) {
        log.w("fetchMessages - DONE with error", err);
        this.messages = null;
        throw err;
      }
    },

    async getHebergements(params = {}) {
      log.i("getHebergements - IN");
      this.isGetHebergementsLoading = true;
      try {
        const { hebergements, count } = await $fetchBackend(
          "/sejour/admin/hebergements",
          {
            method: "GET",
            credentials: "include",
            params,
          },
        );
        log.i("getHebergements - DONE");
        this.hebergements = hebergements;
        this.hebergementsCount = count;
      } catch (err) {
        log.w("getHebergements - DONE with error", err);
        this.hebergements = [];
        this.hebergementsCount = 0;
        throw err;
      } finally {
        this.isGetHebergementsLoading = false;
      }
    },
    async getHebergement(demandeSejourId, hebergementId) {
      log.i("getHebergement - IN");
      this.isGetHebergementLoading = true;
      try {
        const data = await $fetchBackend(
          `/sejour/admin/hebergement/${demandeSejourId}/${hebergementId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        this.hebergement = data.hebergement;
        log.i("getHebergement - DONE");
        return data;
      } catch (err) {
        log.w("getHebergement - DONE with error", err);
        throw err;
      } finally {
        this.isGetHebergementLoading = false;
      }
    },
    async readMessages(declarationId) {
      try {
        const { readMessages } = await $fetchBackend(
          `/message/admin/read/${declarationId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (readMessages) {
          log.i("readMessages - DONE");
        } else {
          throw new Error("erreur sur la lecture des messages");
        }
      } catch (err) {
        log.w("readMessages - DONE with error", err);
        throw err;
      }
    },
  },
});
