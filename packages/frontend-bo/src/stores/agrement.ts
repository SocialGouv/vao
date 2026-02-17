import { defineStore } from "pinia";
import type {
  AgrementDto,
  ActiviteDto,
  OrganismeDto,
} from "@vao/shared-bridge";
import { AgrementService } from "~/services/agrementService";
const log = logger("stores/agrement");
export type AgrementWithOrganismeDto = AgrementDto & {
  organisme: OrganismeDto;
};

export interface AgrementStoreState {
  agrement?: AgrementDto | null;
  agrements?: AgrementWithOrganismeDto[] | null;
  agrementsTotal?: number;
  agrementCourant?: AgrementDto | null;
  activites?: ActiviteDto[];
}

export const useAgrementStore = defineStore("agrement", {
  state: (): AgrementStoreState => ({
    agrement: null,
    agrementCourant: null,
    activites: [],
  }),
  actions: {
    async getListAgrements(params: any): Promise<void> {
      log.i("getListAgrements - IN");
      try {
        const { agrements, count } =
          await AgrementService.getListAgrements(params);
        log.i("getListAgrements - DONE");
        this.agrements = agrements;
        this.agrementsTotal = count;
      } catch (err) {
        log.w("getListAgrements - DONE with error", err);
        throw err;
      }
    },
  },
});
