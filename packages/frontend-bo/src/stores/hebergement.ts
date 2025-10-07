import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";
import type { HebergementDto } from "@vao/shared-bridge";

const log = logger("stores/hebergement");

interface HebergementStoreState {
  hebergements: HebergementDto[];
  hebergementsCount: number;
  isGetHebergementsLoading: boolean;
  hebergement: HebergementDto | null;
  isGetHebergementLoading: boolean;
}

export const useHebergementStore = defineStore("hebergement", {
  state: () =>
    ({
      hebergements: [],
      hebergementsCount: 0,
      isGetHebergementsLoading: false,
      hebergement: null,
      isGetHebergementLoading: false,
    }) as HebergementStoreState,
  actions: {
    async exportHebergements(params = {}) {
      log.i("exportHebergements - IN");
      try {
        const response = await $fetchBackend(`/hebergement/extract/`, {
          method: "GET",
          credentials: "include",
          params,
        });
        log.i("exportHebergements - DONE");
        return response;
      } catch (err) {
        log.w("exportHebergements - DONE with error", err);
        throw err;
      }
    },

    async getHebergements(params = {}) {
      log.i("getHebergements - IN");
      this.isGetHebergementsLoading = true;
      try {
        const { rows, total } = await $fetchBackend("hebergement/admin", {
          method: "GET",
          credentials: "include",
          params,
        });
        log.i("getHebergements - DONE");
        this.hebergements = rows;
        this.hebergementsCount = total;
      } catch (err) {
        log.w("getHebergements - DONE with error", err);
        this.hebergements = [];
        this.hebergementsCount = 0;
        throw err;
      } finally {
        this.isGetHebergementsLoading = false;
      }
    },
    async getHebergement(hebergementId: number) {
      log.i("getHebergement - IN");
      this.isGetHebergementLoading = true;
      try {
        const data = await $fetchBackend(`hebergement/admin/${hebergementId}`, {
          method: "GET",
          credentials: "include",
        });
        this.hebergement = data.hebergement;
        log.i("getHebergement - DONE");
        return data;
      } catch (err) {
        log.w("getHebergement - DONE with error", err);
        throw err;
      } finally {
        this.isGetHebergementLoading = false;
      }
    },
  },
});
