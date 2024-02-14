import { defineStore } from "pinia";
import { useRuntimeConfig, useFetch } from "#app";
import { logger } from "#imports";

const log = logger("stores/operateurs");

export const useOperateurStore = defineStore("operateurs", {
  state: () => ({
    operateurs: [],
    operateurCourant: {},
  }),
  actions: {
    async fetchOperateurs() {
      log.i("fetchOperateurs - IN");
      const config = useRuntimeConfig();

      const { data, error } = await useFetch(
        config.public.backendUrl + "/operateur",
      );
      if (data.value) {
        log.i("fetchOperateurs - DONE");
        this.operateurs = data.value.operateurs;
      }
      if (error.value) {
        log.w("fetchOperateurs - DONE with error", error.value);
        this.operateurs = [];
      }
    },
    async setMyOperateur() {
      log.i("setMyOperateur - IN");
      const config = useRuntimeConfig();

      const { data, error } = await useFetch(
        config.public.backendUrl + "/operateurs",
      );
      if (data.value) {
        log.i("setMyOperateur - DONE");
        this.operateurCourant = data.value.operateur;
      }
      if (error.value) {
        log.w("setMyOperateur - DONE with error", error.value);
        this.operateurCourant = {};
      }
    },
  },
});
