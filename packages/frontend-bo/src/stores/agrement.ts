import { defineStore } from "pinia";
import type {
  AgrementDto,
  ActiviteDto,
  OrganismeDto,
  AGREMENT_STATUT,
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
    async getAgrementById(agrementId: number): Promise<void> {
      log.i("getAgrementById - IN", { agrementId });
      try {
        const agrement = await AgrementService.getById(agrementId);
        log.i("getAgrementById - DONE", { agrement });
        this.agrementCourant = agrement;
      } catch (err) {
        log.w("getAgrementById - DONE with error", err);
        throw err;
      }
    },
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
    async changeStatutAgrement({
      agrementId,
      statut,
    }: {
      agrementId: number;
      statut: AGREMENT_STATUT;
    }): Promise<boolean> {
      log.i("changeStatutAgrement - IN", { agrementId, statut });
      try {
        const { success } = await AgrementService.patchStatut(
          agrementId,
          statut,
        );
        if (success && this.agrementCourant?.id === agrementId) {
          this.agrementCourant.statut = statut;
        }
        log.i("changeStatutAgrement - DONE", { success });
        return success;
      } catch (err) {
        log.w("changeStatutAgrement - ERROR", err);
        throw err;
      }
    },
  },
});
