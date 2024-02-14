import { defineStore } from "pinia";

const log = logger("stores/operateurs");

export const useOperateurStore = defineStore("operateurs", {
  state: () => ({
    operateurs: [],
    operateurCourant: {}
  }),
  actions: {
    async fetchOperateurs() {
      try {
        log.i("fetchOperateurs - IN");
        const response = await $fetch("http://localhost:3010/operateur", {
          credentials: "include"
        });
        const operateurs = response.operateurs;
        this.operateurs = operateurs;
        log.d("fetchOperateurs - DONE");
      } catch (err) {
        this.operateurs = [];
        log.i("fetchOperateurs - DONE with error");
      }
    },
    async setMyOperateur() {
      try {
        const { public: { backendUrl } } = useRuntimeConfig();
        const response = await $fetch(`${backendUrl}/operateur/`, {
          credentials: "include"
        });

        log.d(response);
        this.operateurCourant = response.operateur;
        log.d("setOperateurCourant - DONE");
      } catch (err) {
        this.operateurCourant = {};
        log.i("setOperateurCourant - DONE with error");
      }
    }
  }
});
