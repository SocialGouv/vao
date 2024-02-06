import { defineStore } from "pinia";

const log = logger("stores/operateurs");

export const useOperateurStore = defineStore("operateurs", {
  state: () => ({
    operateurs: [],
    operateurCourant: {},
  }),
  actions: {
    async fetchOperateurs() {
      try {
        log.i("fetchOperateurs - IN");

        const response = await $fetch("/front-server/operateurs");
        const operateurs = response.operateurs;
        this.operateurs = operateurs;
        log.d("fetchOperateurs - DONE");
      } catch (err) {
        this.operateurs = [];
        log.i("fetchOperateurs - DONE with error");
      }
    },
    async setOperateurCourant(id) {
      try {
        log.i("setOperateurCourant - IN", { id });

        const response = await $fetch(`/front-server/operateurs/${id}`);
        log.d(response);
        this.operateurCourant = response.operateur;
        log.d("setOperateurCourant - DONE");
      } catch (err) {
        this.operateurCourant = {};
        log.i("setOperateurCourant - DONE with error");
      }
    },
  },
});
