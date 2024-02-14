import { defineStore } from "pinia";
import { useRuntimeConfig, useFetch } from "#app";
import { logger } from "#imports";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: {},
  }),
  actions: {
    async fetchHebergement() {
      log.i("fetchHebergement - IN");

      const config = useRuntimeConfig();
      const { data, error } = await useFetch(
        config.public.backendUrl + "/hebergement",
      );
      if (data.value) {
        log.i("fetchHebergement - DONE");
        this.hebergements = data.value.hebergements;
      }
      if (error.value) {
        log.w("fetchHebergement - DONE with error", error.value);
        this.hebergements = [];
      }
    },
    async setHebergementCourant(id) {
      log.i("setHebergementCourant - IN", { id });

      const config = useRuntimeConfig();
      const { data, error } = await useFetch(
        `${config.public.backendUrl}/hebergement/${id}`,
      );
      if (data.value) {
        log.i("setHebergementCourant - DONE");
        this.hebergementCourant = data.value.hebergement;
      }
      if (error.value) {
        log.w("setHebergementCourant - DONE with error", error.value);
        this.hebergementCourant = {};
      }
    },
  },
});
