import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: null,
  }),
  actions: {
    async fetch() {
      try {
        log.i("fetch - IN");
        const { hebergements } = await $fetchBackend("/hebergement", {
          credentials: "include",
        });
        if (hebergements) {
          this.hebergements = hebergements;
        }
        log.d("fetch  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetch - DONE with error");
      }
    },
    async fetchById(id) {
      try {
        log.i("fetchById - IN", { id });

        const { hebergement } = await $fetchBackend(`/hebergement/${id}`, {
          credentials: "include",
        });
        log.d(hebergement);
        if (hebergement) {
          this.hebergementCourant = hebergement;
        }
        log.d("fetchById - DONE");
      } catch (err) {
        this.hebergementCourant = null;
        log.i("fetchById - DONE with error");
      }
    },
    async updateOrCreate(hebergement, hebergementId) {
      log.i("updateOrCreate - IN", { hebergement });

      const url = hebergementId
        ? `/hebergement/${hebergementId}`
        : `/hebergement`;

      const { id } = await $fetchBackend(url, {
        method: "POST",
        body: hebergement,
        credentials: "include",
      });
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
  },
});
