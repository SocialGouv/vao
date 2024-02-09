import { defineStore } from "pinia";

export const useDepartementStore = defineStore("departement", {
  state: () => ({
    departements: [],
  }),
  actions: {
    async fetch() {
      const config = useRuntimeConfig()
      try {
        const response = await $fetch(config.public.backendUrl + "/geo/departements");
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
      const config = useRuntimeConfig()
      try {
        const response = await $fetch(config.public.backendUrl + "/geo/regions");
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
