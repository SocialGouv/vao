import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: null,
  }),
  actions: {
    async fetchHebergements() {
      try {
        log.i("fetchHebergements - IN");
        const { hebergements } = await $fetchBackend("/hebergement", {
          credentials: "include",
        });
        if (hebergements) {
          this.hebergements = hebergements;
        }
        log.d("fetchHebergements  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetchHebergements - DONE with error");
      }
    },
    async fetchHebergement(id) {
      try {
        log.i("fetchHebergement - IN", { id });

        const { hebergement } = await $fetchBackend(`/hebergement/${id}`, {
          credentials: "include",
        });
        log.d(hebergement);
        if (hebergement) {
          this.hebergementCourant = hebergement;
        }
        log.d("fetchHebergement - DONE");
      } catch (err) {
        this.hebergementCourant = null;
        log.i("fetchHebergement - DONE with error");
      }
    },
  },
});
