import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";

interface DepartementStoreState {
  departements: {
    text: string;
    value: string;
  }[];
}

export const useDepartementStore = defineStore("departement", {
  state: (): DepartementStoreState => ({
    departements: [],
  }),
  actions: {
    async fetch() {
      try {
        const {
          departements,
        }: { departements: DepartementStoreState["departements"] } =
          await $fetchBackend("/geo/departements");
        if (departements) {
          this.departements = departements.map((departement) => ({
            text: `${departement.value} - ${departement.text}`,
            value: departement.value,
          }));
        }
      } catch {
        this.departements = [];
      }
    },
  },
});

interface RegionStoreState {
  regions: {
    text: string;
    value: string;
  }[];
}

export const useRegionStore = defineStore("region", {
  state: (): RegionStoreState => ({
    regions: [],
  }),
  actions: {
    async fetch() {
      try {
        const { regions }: { regions: RegionStoreState["regions"] } =
          await $fetchBackend("/geo/regions");
        if (regions) {
          this.regions = regions.map((region) => ({
            text: `${region.value} - ${region.text}`,
            value: region.value,
          }));
        }
      } catch {
        this.regions = [];
      }
    },
  },
});
