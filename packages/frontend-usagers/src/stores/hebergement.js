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

        const { data } = await useFetchWithCredentials("/hebergement");
        if (data.value?.hebergements) {
          this.hebergements = data.value.hebergements;
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

        const { data } = await useFetchWithCredentials(`/hebergement/${id}`);
        log.d(data);
        if (data.value?.hebergement) {
          this.hebergementCourant = data.value.hebergement;
        }
        log.d("setHebergementCourant - DONE");
      } catch (err) {
        this.hebergementCourant = {};
        log.i("setHebergementCourant - DONE with error");
      }
    },
  },
});
