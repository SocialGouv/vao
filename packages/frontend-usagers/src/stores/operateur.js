import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/operateurs");

export const useOperateurStore = defineStore("operateurs", {
  state: () => ({
    operateurs: [],
    operateurCourant: null,
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
        // TODO : à retirer après que cette api ne renvoie que l'opérateur souhaité
        if (!operateur || operateur.length === 0) {
          this.operateurCourant = null;
        } else if (operateur.length) {
          this.operateurCourant = operateur[0];
        } else {
          this.operateurCourant = operateur;
        }
        log.d("setOperateurCourant - DONE");
      } catch (err) {
        this.operateurCourant = null;
        log.i("setOperateurCourant - DONE with error");
      }
    },
  },
});
