import { defineStore } from "pinia";
import { $fetchBackend, eig, logger } from "#imports";
import { eigModel } from "@vao/shared";

const log = logger("stores/hebergement");

export const useEigStore = defineStore("eig", {
  state: () => ({
    eigs: [],
    currentEig: null,
    total: 0,
  }),
  getters: {
    canModify() {
      return (
        !this.currentEig ||
        (this.currentEig?.statut === eigModel.Statuts.BROUILLON &&
          eig.isDeclarationligibleToEig({
            dateDebut: this.currentEig.dateDebut,
            dateFIn: this.currentEig.dateFIn,
            statut: this.currentEig.dsStatut,
          }))
      );
    },
  },
  actions: {
    async setCurrentEig(eigId) {
      if (!eigId) {
        this.currentEig = null;
      } else {
        log.i("fetchEig for one id - IN");

        try {
          const { eig } = await $fetchBackend(`/eig/${eigId}`, {
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
        const { eig } = await $fetchBackend(`/eig/me`, {
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
    async updateEig(eigId, type, data) {
      try {
        return await $fetchBackend(`/eig/${eigId}`, {
          method: "PUT",
          credentials: "include",
          body: {
            parametre: data,
            type: type,
          },
        });
      } catch (err) {
        log.w("update for one id - DONE with error", err);
        throw err;
      }
    },
    async create(data) {
      try {
        return await $fetchBackend(`/eig`, {
          method: "POST",
          credentials: "include",
          body: {
            parametre: data,
          },
        });
      } catch (err) {
        log.w("update for one id - DONE with error", err);
        throw err;
      }
    },
  },
});
