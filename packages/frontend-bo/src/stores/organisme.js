import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/organisme");

export const useOrganismeStore = defineStore("organisme", {
  state: () => ({
    organisme: null,
    organismes: [],
    total: 0,
  }),
  getters: {
    isConnected: (state) => !!state.user,
  },
  actions: {
    async fetchOrganismes({ search } = {}) {
      log.i("fetchOrganismes - IN");
      try {
        // Appel du back pour la liste des utilisateurs
        const { organismes, total } = await $fetchBackend(
          "/organisme/bo/liste",
          {
            credentials: "include",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            params: {
              search,
            },
          },
        );
        log.d("fetchOrganismes - réponse", { organismes, total });
        this.organismes = organismes;
        this.total = parseInt(total);
        log.i("fetchOrganismes - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.organismes = [];
        this.total = 0;
        log.w("fetchOrganismes - Erreur", { error });
      }
    },

    async getOrganisme(id) {
      log.i("getOrganisme - IN", { id });
      try {
        // Appel du back pour la liste des utilisateurs
        const organisme = await $fetchBackend("/organisme/bo/" + id, {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        log.d("getOrganisme", { organisme });
        this.organisme = organisme.organisme;
        log.i("getOrganisme - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.organisme = null;
        log.w("getOrganisme - Erreur", { error });
      }
    },
  },
});
