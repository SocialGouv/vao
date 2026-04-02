import { defineStore } from "pinia";
import type {
  AgrementDto,
  AgrementFilesDto,
  ActiviteDto,
  OrganismeDto,
  AGREMENT_STATUT,
  AgrementHistoryItem,
  AgrementMessage,
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
  history: AgrementHistoryItem[] | null;
  messages: AgrementMessage[] | null;
}

export const useAgrementStore = defineStore("agrement", {
  state: (): AgrementStoreState => ({
    agrement: null,
    agrementCourant: null,
    activites: [],
    history: null,
    messages: null,
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
    async getMessages(agrementId: string): Promise<void> {
      log.i("getMessages - IN", { agrementId });
      try {
        const messages = await AgrementService.getMessages(agrementId);
        log.i("getMessages - DONE", { messages });
        this.messages = messages;
      } catch (err) {
        log.w("getMessages - DONE with error", err);
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
    async getHistory(agrementId: string): Promise<void> {
      log.i("getHistory - IN", { agrementId });
      try {
        const { history } = await AgrementService.getHistory(agrementId);
        this.history = history;
        log.i("getHistory - DONE", { history });
      } catch (err) {
        log.w("getHistory - DONE with error", err);
        throw err;
      }
    },
    async changeStatutAgrement({
      agrementId,
      statut,
      commentaire,
      file,
    }: {
      agrementId: number;
      statut: AGREMENT_STATUT;
      commentaire?: string;
      file?: AgrementFilesDto;
    }): Promise<boolean> {
      log.i("changeStatutAgrement - IN", { agrementId, statut });
      try {
        const { success } = await AgrementService.patchStatut(
          agrementId,
          statut,
          commentaire,
          file,
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
    async postMessage({
      agrementId,
      message,
    }: {
      agrementId: string;
      message: string;
    }): Promise<void> {
      log.i("postMessage - IN", { agrementId, message });
      try {
        await AgrementService.postMessage(agrementId, message);
        log.i("postMessage - DONE");
      } catch (err) {
        log.w("postMessage - ERROR", err);
        throw err;
      }
    },
  },
});
