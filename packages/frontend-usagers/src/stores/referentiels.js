import { defineStore } from "pinia";

export const useDepartementStore = defineStore("departement", {
  state: () => ({
    departements: [],
  }),
  actions: {
    async fetch() {
      try {
        const response = await $fetch("/front-server/geo/departements");
        this.departements = response.departements.map((departement) => ({
          text: `${departement.value} - ${departement.text}`,
          value: departement.value,
        }));
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
        const response = await $fetch("/front-server/geo/regions");
        this.regions = response.regions.map((region) => ({
          text: `${region.value} - ${region.text}`,
          value: region.value,
        }));
      } catch (err) {
        this.regions = [];
      }
    },
  },
});
