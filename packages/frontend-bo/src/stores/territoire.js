import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("/store/territoire");

export const useTerritoireStore = defineStore("territoire", {
  state: () => ({
    territoires: [],
    territoire: {},
    total: null,
  }),
  actions: {
    async fetch(params) {
      log.i("fetch - IN");
      try {
        const { territoires, total } = await $fetchBackend("/territoire/list", {
          method: "GET",
          credentials: "include",
          params,
        });
        if (territoires) {
          log.i("fetch - DONE");
          this.territoires = territoires;
          this.total = total;
        }
      } catch (err) {
        log.w("fetch - DONE with error", err);
        this.territoires = [];
        this.total = 0;
        throw err;
      }
    },
    async get(idTerritoire) {
      log.i("get - IN");
      try {
        const row = await $fetchBackend(`/territoire/get-one/${idTerritoire}`, {
          method: "GET",
          credentials: "include",
        });
        this.territoire = row.territoire;
        log.i("get - DONE");
      } catch (err) {
        log.w("get - DONE with error", err);
        throw err;
      }
    },
    async getFicheIdByTerritoireCode(TerritoireCode) {
      log.i("get - IN");
      try {
        const row = await $fetchBackend(
          `/territoire/get-fiche-id-by-ter-code/${TerritoireCode}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        log.i("get - DONE");
        return row.territoire.id;
      } catch (err) {
        log.w("get - DONE with error", err);
        throw err;
      }
    },
    async update(idTerritoire, params) {
      log.i("update - IN");
      try {
        const response = await $fetchBackend(`/territoire/${idTerritoire}`, {
          credentials: "include",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: params,
        });
        log.i("update - DONE");
        return response;
      } catch (err) {
        log.w("update - DONE with error", err);
        throw err;
      }
    },
  },
});
