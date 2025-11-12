import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/agrement");

export const useAgrementStore = defineStore("agrement", {
  state: () => ({
    agrement: {},
  }),
  actions: {
    async getByOrganismeId(organismeId) {
      log.i("getByOrganismeId - IN");
      try {
        const result = await $fetchBackend(
          `/agrements/organisme/${organismeId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        log.i("getByOrganismeId - DONE");
        this.agrement = result.agrement;
      } catch (err) {
        log.w("getByOrganismeId - DONE with error", err);
        throw err;
      }
    },
    async updateAgrement(agrementData) {
      log.i("updateAgrement - IN");
      try {
        this.agrement = {
          ...this.agrement,
          ...agrementData,
        };
        log.i("updateAgrement - DONE");
      } catch (err) {
        log.w("updateAgrement - DONE with error", err);
        throw err;
      }
    },
    // todo: commit agrement backend
  },
});
