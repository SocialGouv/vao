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
        const { territoires } = await $fetchBackend("/geo/territoires");
        if (territoires) {
          this.territoires = territoires.map((territoire) => ({
            territoireId: territoire.territoire_id,
            text: territoire.text,
            value: territoire.value,
            typeTerritoire: territoire.type,
            serviceMail: territoire.service_mail,
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
          `/geo/territoires/${idTerritoire}`,
        );
        this.territoire = rows.territoires[0];
      } catch (err) {
        this.territoire = [];
      }
    },    
  },
});

export const useDepartementStore = defineStore("departement", {
  state: () => ({
    departements: [],
  }),
  actions: {
    async fetch() {
      try {
        const { departements } = await $fetchBackend("/geo/departements");
        if (departements) {
          this.departements = departements.map((departement) => ({
            text: `${departement.value} - ${departement.text}`,
            value: departement.value,
            region: departement.region,
          }));
        }
      } catch (err) {
        this.departements = [];
      }
    },
  },
});

export const useRegionStore = defineStore("region", {
  state: () => ({
    regions: [],
  }),
  actions: {
    async fetch() {
      try {
        const { regions } = await $fetchBackend("/geo/regions");
        if (regions) {
          this.regions = regions.map((region) => ({
            text: `${region.value} - ${region.text}`,
            value: region.value,
          }));
        }
      } catch (err) {
        this.regions = [];
      }
    },
  },
});
