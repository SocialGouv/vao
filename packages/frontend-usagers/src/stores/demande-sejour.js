import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/demande-sejour");

const resetDemandeCourante = () => ({
  informationsOrganisme: {},
  informationsVacanciers: {},
  informationsPersonnel: {},
  projetSejour: {},
  informationsTransport: {},
  informationsSanitaires: {},
  hebergement: {},
  stats: null,
});

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    demandeCourante: resetDemandeCourante(),
    messages: [],
  }),
  actions: {
    async fetchDemandes({ sortBy } = {}) {
      log.i("fetchDemandes - IN");
      try {
        const { demandes } = await $fetchBackend("/sejour", {
          method: "GET",
          credentials: "include",
          params: {
            sortBy,
          }
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
    async setDemandeCourante(id) {
      log.i("setDemandeCourante - IN");
      try {
        const { demande } = await $fetchBackend(`/sejour/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (demande) {
          log.i("setDemandeCourante - DONE");
          this.demandeCourante = demande;
        }
      } catch (err) {
        log.w("setDemandeCourante - DONE with error", err);
        this.demandeCourante = resetDemandeCourante();
      }
    },
    async resetDemandeCourante() {
      log.i("resetDemandeCourante - IN");
      this.demandeCourante = resetDemandeCourante();
    },
    async postDemande(demande) {
      log.i("postDemande - IN", { demande });
      try {
        await $fetchBackend(`/demandes-sejour`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(demande),
        });
        log.i("postDemande - DONE");
      } catch (err) {
        log.w("postDemande - DONE with error", err);
      }
    },
    async fetchMessages(declarationId) {
      log.i("fetchMessages - IN", { declarationId });
      try {
        const messages = await $fetchBackend(`/message/${declarationId}`, {
          method: "GET",
          credentials: "include",
        });

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
    async readMessages(declarationId) {
      log.i("readMessages - In");
      try {
        const { readMessages } = await $fetchBackend(
          `/message/read/${declarationId}`,
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
    async getStats() {
      log.i("getStats - In");
      try {
        const { stats } = await $fetchBackend("/sejour/stats", {
          method: "GET",
          credentials: "include",
        });
        this.stats = stats;
        return stats;
      } catch (err) {
        log.w("getStats - DONE with error", err);
        throw err;
      }
    },
  },
});
