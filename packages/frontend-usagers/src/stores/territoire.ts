import { defineStore } from "pinia";
import type { TerritoireDto } from "@vao/shared-bridge";
import { logger } from "#imports";
import { TerritoireService } from "~/services/territoireService";
const log = logger("stores/territoire");
interface TerritoireStoreState {
  territoire: TerritoireDto | null;
}

export const useTerritoireStore = defineStore("territoire", {
  state: (): TerritoireStoreState => ({
    territoire: null,
  }),
  actions: {
    async fetchFicheByAgrementRegionUser() {
      try {
        const territoire = await TerritoireService.getTerritoire();
        if (territoire) {
          this.territoire = territoire;
        }
      } catch (err: unknown) {
        this.territoire = null;
        log.i("fetchById - DONE with error", err);
      }
    },
  },
});
