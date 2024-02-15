import { defineStore } from "pinia";
import { logger, useFetchWithCredentials } from "#imports";

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
        const { data } = await useFetchWithCredentials("/operateur");
        if (data.value?.operateurs) {
          this.operateurs = data.value.operateurs;
        }
        log.d("fetchOperateurs - DONE");
      } catch (err) {
        this.operateurs = [];
        log.i("fetchOperateurs - DONE with error");
      }
    },
    async setMyOperateur() {
      try {
        const { data } = await useFetchWithCredentials(`/operateur`);
        log.d(data);
        if (data.value?.operateur) {
          this.operateurCourant = data.value.operateur;
        }
        log.d("setOperateurCourant - DONE");
      } catch (err) {
        this.operateurCourant = {};
        log.i("setOperateurCourant - DONE with error");
      }
    },
  },
});
