import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";

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
