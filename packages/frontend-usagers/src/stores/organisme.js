import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/organismes");

export const useOrganismeStore = defineStore("organismes", {
  state: () => ({
    organismes: [],
    organismeCourant: null,
  }),
  actions: {
    async fetchOrganismes() {
      try {
        log.i("fetchOrganismes - IN");
        const { organismes } = await $fetchBackend("/organisme", {
          credentials: "include",
        });
        if (organismes) {
          this.organismes = organismes;
        }
        log.d("fetchOrganismes - DONE");
      } catch (err) {
        this.organismes = [];
        log.i("fetchOrganismes - DONE with error");
      }
    },
    async setMyOrganisme() {
      try {
        const { organisme } = await $fetchBackend(`/organisme`, {
          credentials: "include",
        });
        // TODO : à retirer après que cette api ne renvoie que l'organisme souhaité
        if (!organisme || organisme.length === 0) {
          this.organismeCourant = null;
        } else if (organisme.length) {
          this.organismeCourant = organisme[0];
        } else {
          this.organismeCourant = organisme;
        }
        log.d("setOrganismeCourant - DONE");
      } catch (err) {
        this.organismeCourant = null;
        log.i("setOrganismeCourant - DONE with error");
      }
    },
  },
});
