import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/hebergement");

export const useEigStore = defineStore("eig", {
  state: () => ({
    eigs: [],
    currentEig: null,
    total: 0,
  }),

  actions: {
    getById(eigId) {
      return this.eigs.find((eig) => eig.id === eigId);
    },
    async setCurrentEig(eigId) {
      if (!eigId) {
        this.currentEig = null;
      } else {
        log.i("fetchEig for one id - IN");

        try {
          const { eig } = await $fetchBackend(`/eig/admin/${eigId}`, {
            method: "GET",
            credentials: "include",
          });

          this.currentEig = eig;
          log.i("fetchEig for one id - OUT");
        } catch (err) {
          log.w("fetchEig for one id - DONE with error", err);
          this.currentEig = null;
          throw err;
        }
      }
    },
    async get({ limit, offset, sortBy, sortDirection, search } = {}) {
      log.i("fetchEig - IN");

      try {
        const { eig } = await $fetchBackend(`/eig/admin`, {
          method: "GET",
          credentials: "include",
          params: {
            limit,
            offset,
            sortBy,
            sortDirection,
            search,
          },
        });

        this.eigs = eig.eigs;
        this.total = eig.total;
        log.i("fetchEig - OUT");
      } catch (err) {
        log.w("fetchEig for one id - DONE with error", err);
        this.currentEig = null;
        throw err;
      }
    },
    async markAsRead(eigId) {
      log.i("markAsRead - IN");

      try {
        await $fetchBackend(`/eig/admin/${eigId}/mark-as-read`, {
          method: "POST",
          credentials: "include",
        });

        log.i("markAsRead - OUT");
      } catch (err) {
        log.w("markAsRead for one id - DONE with error", err);
        this.currentEig = null;
        throw err;
      }
    },
  },
});
