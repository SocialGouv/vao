import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";

export const useTerritoireStore = defineStore("territoire", {
  state: () => ({
    territoires: [],
    territoire: {},
  }),
  actions: {
    async fetch() {
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
            typeTerritoire: territoire.type,
            serviceMail: territoire.service_mail,
            serviceTelephone: territoire.service_telephone,
            correspVaoNom: territoire.corresp_vao_nom,
            correspVaoPrenom: territoire.corresp_vao_prenom,
            nbUsersBO: territoire.nbusersbo,
          }));
        }
      } catch (err) {
        this.territoires = [];
      }
    },
    async get(idTerritoire) {
      try {
        const rows = await $fetchBackend(
          `/territoire/get-one/${idTerritoire}`,
          {
            method: "GET",
            credentials: "include",
        });
        this.territoire = rows.territoires[0];
      } catch (err) {
        this.territoire = [];
      }
    },
  },
});
