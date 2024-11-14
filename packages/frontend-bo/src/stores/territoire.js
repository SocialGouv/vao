import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("/store/territoire");

export const useTerritoireStore = defineStore("territoire", {
  state: () => ({
    territoires: [],
    territoire: {},
  }),
  actions: {
    async fetch() {
      log.i("fetch - IN");
      try {
        const { territoires } = await $fetchBackend("/territoire/list", {
          method: "GET",
          credentials: "include",
        });
        if (territoires) {
          this.territoires = territoires.map((territoire) => ({
            territoireId: territoire.territoire_id,
            text: territoire.text,
            value: territoire.value,
            parent: territoire.parent,
            typeTerritoire: territoire.type,
            serviceMail: territoire.service_mail,
            serviceTelephone: territoire.service_telephone,
            correspVaoNom: territoire.corresp_vao_nom,
            correspVaoPrenom: territoire.corresp_vao_prenom,
            nbUsersBO: territoire.nbusersbo,
          }));
        }
      } catch (err) {
        log.w("fetch - DONE with error", err);
        throw err;
      }
      log.i("fetch - DONE");
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
