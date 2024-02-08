import { defineStore } from "pinia";

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
        const config = useRuntimeConfig()

        const response = await $fetch(config.public.backendUrl + "/hebergement");
        this.hebergements = response.hebergements;
        log.d("fetchHebergements  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetchHebergement - DONE with error");
      }
    },
    async setHebergementCourant(id) {
      try {
        log.i("setHebergementCourant - IN", { id });
        const config = useRuntimeConfig()

        const response = await $fetch(`${config.public.backendUrl}/hebergement/${id}`);
        log.d(response);
        this.hebergementCourant = response.hebergement;
        log.d("setHebergementCourant - DONE");
      } catch (err) {
        this.hebergementCourant = {};
        log.i("setHebergementCourant - DONE with error");
      }
    },
  },
});
