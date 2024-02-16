import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

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
        const { operateurs } = await $fetchBackend("/operateur", {
          credentials: "include",
        });
        if (operateurs) {
          this.operateurs = operateurs;
        }
        log.d("fetchOperateurs - DONE");
      } catch (err) {
        this.operateurs = [];
        log.i("fetchOperateurs - DONE with error");
      }
    },
    async setMyOperateur() {
      try {
        const { operateur } = await $fetchBackend(`/operateur`, {
          credentials: "include",
        });
        log.d(operateur);
        if (operateur) {
          this.operateurCourant = operateur;
        }
        log.d("setOperateurCourant - DONE");
      } catch (err) {
        this.operateurCourant = {};
        log.i("setOperateurCourant - DONE with error");
      }
    },
  },
});
