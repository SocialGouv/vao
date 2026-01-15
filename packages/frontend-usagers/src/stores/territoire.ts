import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";
import type { TerritoireDto } from "@vao/shared-bridge";

interface TerritoireStoreState<TerritoireDto> {
  territoire: TerritoireDto | null;
}

export const useTerritoireStore = defineStore("territoire", {
  state: (): TerritoireStoreState<TerritoireDto> => ({
    territoire: null,
  }),
  actions: {
    async fetchFicheByAgrementRegionUser() {
      try {
        const { ficheTerritoire } = await $fetchBackend(
          "/territoire/get-by-agrement-region-user",
          {
            credentials: "include",
          },
        );
        this.territoire = ficheTerritoire;
      } catch {
        this.territoire = null;
      }
    },
  },
});
