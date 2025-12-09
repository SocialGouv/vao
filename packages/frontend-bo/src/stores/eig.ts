import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/hebergement");

interface EigDto {
  id: number;
  dateDepot: string;
  readByDreets: boolean;
  readByDdets: boolean;
  file: string;
}

interface EigStoreState {
  eigs: EigDto[];
  currentEig: EigDto | null;
  total: number;
  totalNonLus: number;
}

export const useEigStore = defineStore("eig", {
  state: (): EigStoreState => ({
    eigs: [],
    currentEig: null,
    total: 0,
    totalNonLus: 0,
  }),

  actions: {
    getById(eigId: string) {
      return this.eigs.find((eig) => eig.id === eigId);
    },
    async getPdf(eigId: string) {
      log.i("getPdf - IN", eigId);
      try {
        return await $fetchBackend(`/eig/admin/pdf/${eigId}`, {
          method: "GET",
          credentials: "include",
        });
      } catch (err) {
        log.w("getPdf - DONE with error", err);
        throw err;
      }
    },
    async getTotalEigToRead() {
      try {
        const { totalToRead } = await $fetchBackend(
          `/eig/admin/total-to-read/`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        this.totalNonLus = totalToRead;
        log.i("getTotalEigToRead - DONE");
      } catch (err) {
        log.w("getTotalEigToRead - DONE with error", err);
        this.currentEig = null;
        throw err;
      }
    },

    async setCurrentEig(eigId: string) {
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
    async get({
      limit,
      offset,
      sortBy,
      sortDirection,
      search,
    }: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: string;
      search?: string;
    } = {}) {
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
    async markAsRead(eigId: string) {
      log.i("markAsRead - IN");

      try {
        await $fetchBackend(`/eig/admin/${eigId}/mark-as-read`, {
          method: "POST",
          credentials: "include",
        });
        await this.getTotalEigToRead();
        log.i("markAsRead - OUT");
      } catch (err) {
        log.w("markAsRead for one id - DONE with error", err);
        this.currentEig = null;
        throw err;
      }
    },
  },
});
