import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementsCount: 0,
    isGetHebergementsLoading: false,
    hebergement: null,
    isGetHebergementLoading: false,
  }),
  actions: {
    async exportHebergements(params) {
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
        const { hebergements, count } = await $fetchBackend(
          "hebergement/admin",
          {
            method: "GET",
            credentials: "include",
            params,
          },
        );
        log.i("getHebergements - DONE");
        this.hebergements = hebergements;
        this.hebergementsCount = count;
      } catch (err) {
        log.w("getHebergements - DONE with error", err);
        this.hebergements = [];
        this.hebergementsCount = 0;
        throw err;
      } finally {
        this.isGetHebergementsLoading = false;
      }
    },
    async getHebergement(hebergementId) {
      log.i("getHebergement - IN");
      this.isGetHebergementLoading = true;
      try {
        // eslint-disable-next-line prettier/prettier
        const data = await $fetchBackend(
          `hebergement/admin/${hebergementId}`,
          {
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
