import { defineStore } from "pinia";
import { useRuntimeConfig, useFetch } from "#app";

export const useDepartementStore = defineStore("departement", {
  state: () => ({
    departements: [],
  }),
  actions: {
    async fetch() {
      const config = useRuntimeConfig();

      const { data, error } = await useFetch(
        config.public.backendUrl + "/geo/departements",
      );
      if (data.value) {
        this.departements = data.value.departements.map((departement) => ({
          text: `${departement.value} - ${departement.text}`,
          value: departement.value,
        }));
      }
      if (error.value) {
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
      const config = useRuntimeConfig();

      const { data, error } = await useFetch(
        config.public.backendUrl + "/geo/regions",
      );
      if (data.value) {
        this.regions = data.value.regions.map((region) => ({
          text: `${region.value} - ${region.text}`,
          value: region.value,
        }));
      }
      if (error.value) {
        this.regions = [];
      }
    },
  },
});
