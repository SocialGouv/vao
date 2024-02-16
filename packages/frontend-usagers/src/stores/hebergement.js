import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: {},
  }),
  actions: {
    async fetchHebergement() {
      try {
        log.i("fetchHebergement - IN");
        const { hebergements } = await $fetchBackend("/hebergement", {
          credentials: "include",
        });
        if (hebergements) {
          this.hebergements = hebergements;
        }
        log.d("fetchHebergements  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetchHebergement - DONE with error");
      }
    },
    async setHebergementCourant(id) {
      try {
        log.i("setHebergementCourant - IN", { id });

        const { hebergement } = await $fetchBackend(`/hebergement/${id}`, {
          credentials: "include",
        });
        log.d(hebergement);
        if (hebergement) {
          this.hebergementCourant = hebergement;
        }
        log.d("setHebergementCourant - DONE");
      } catch (err) {
        this.hebergementCourant = {};
        log.i("setHebergementCourant - DONE with error");
      }
    },
  },
});
