import { defineStore } from "pinia";
import type {
  AgrementDto,
  ActiviteDto,
  AgrementHistoryItem,
  AgrementMessage,
} from "@vao/shared-bridge";
import {
  AGREMENT_STATUT,
  daysBetween,
  addMonths,
  isBetweenDates,
  addDays,
} from "@vao/shared-bridge";
import { AgrementService } from "~/services/agrementService";

const log = logger("stores/agrement");

const ALLOWED_STATUTS_RENOUVELLEMENT = [
  AGREMENT_STATUT.BROUILLON,
  AGREMENT_STATUT.A_MODIFIER,
  AGREMENT_STATUT.COMPLETUDE_CONFIRME,
  AGREMENT_STATUT.DEPOSE,
  AGREMENT_STATUT.EN_COURS,
  AGREMENT_STATUT.PRIS_EN_CHARGE,
  AGREMENT_STATUT.VERIF_EN_COURS,
];
export interface AgrementStoreState {
  agrement: AgrementDto | null;
  agrementCourant: AgrementDto | null;
  agrementEnTraitement: AgrementDto | null;
  activites: ActiviteDto[];
  history: AgrementHistoryItem[] | null;
  messages: AgrementMessage[] | null;
  messagesTotal?: number | null;
  messagesUnreadCount?: number | null;
}

export const useAgrementStore = defineStore("agrement", {
  state: (): AgrementStoreState => ({
    agrement: null,
    agrementCourant: null,
    agrementEnTraitement: null,
    activites: [],
    history: null,
    messages: null,
    messagesTotal: null,
  }),
  getters: {
    expiryDate: (state): Date | null => {
      return state.agrementCourant?.dateFinValidite
        ? new Date(state.agrementCourant.dateFinValidite)
        : null;
    },

    daysUntilExpiry(): number | null {
      if (!this.expiryDate) return null;
      return daysBetween(new Date(), this.expiryDate);
    },

    sixMonthsFromNow(): Date {
      return addMonths(new Date(), 6);
    },

    isExpirySoon(): boolean {
      const days = this.daysUntilExpiry;
      return days !== null && days >= 0 && days <= 120;
    },

    isExpiryMedium(): boolean {
      if (!this.expiryDate) return false;

      return isBetweenDates(
        this.expiryDate,
        addDays(new Date(), 121),
        this.sixMonthsFromNow,
      );
    },
  },

  actions: {
    async getCurrent(): Promise<void> {
      log.i("getCurrent - IN");

      try {
        const { agrements } = await AgrementService.getListAgrements({
          statut: AGREMENT_STATUT.VALIDE,
        });

        if (!agrements || agrements.length === 0) {
          this.agrementCourant = null;
        } else {
          const { agrement: agrementDetail } = await AgrementService.get(
            agrements[0].id!,
          );

          this.agrementCourant = agrementDetail;
        }
      } catch (err) {
        log.w("getCurrent - DONE with error", err);
        throw err;
      }
    },
    async getEnRenouvellement(): Promise<void> {
      log.i("getEnRenouvellement - IN");
      try {
        const { agrements }: { agrements: AgrementDto[] | [] } =
          await AgrementService.getListAgrements({});

        const filtered = agrements.filter(
          (agrement) =>
            agrement.statut !== null &&
            ALLOWED_STATUTS_RENOUVELLEMENT.includes(
              agrement.statut as AGREMENT_STATUT,
            ),
        );
        if (filtered.length === 0) {
          this.agrementEnTraitement = null;
          log.i("getEnRenouvellement - DONE no agrement in renouvellement");
          return;
        }
        const { agrement: agrementDetail } = await AgrementService.get(
          filtered[0].id!,
        );
        log.i("getEnRenouvellement - DONE");
        this.agrementEnTraitement = agrementDetail ?? null;
      } catch (err) {
        log.w("getEnRenouvellement - DONE with error", err);
        throw err;
      }
    },
    async patchMessagesAsRead(agrementId: string): Promise<number> {
      log.i("patchMessagesAsRead - IN", { agrementId });
      try {
        const count = await AgrementService.markMessagesAsRead(agrementId);
        log.i("patchMessagesAsRead - DONE", { count });
        return count;
      } catch (err) {
        log.w("patchMessagesAsRead - ERROR", err);
        throw err;
      }
    },
    async getMessages(agrementId: string): Promise<void> {
      log.i("getMessages - IN", { agrementId });
      try {
        const { count, messages, unreadCount } =
          await AgrementService.getMessages(agrementId);
        log.i("getMessages - DONE", { messages, count, unreadCount });
        this.messages = messages;
        this.messagesTotal = count;
        this.messagesUnreadCount = unreadCount;
      } catch (err) {
        log.w("getMessages - DONE with error", err);
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
      try {
        await AgrementService.postMessage(agrementId, message);
        log.i("postMessage - DONE");
      } catch (err) {
        log.w("postMessage - ERROR", err);
        throw err;
      }
    },
    async postAgrement({
      agrement,
      organismeId,
    }: {
      agrement: Partial<AgrementDto>;
      organismeId: number;
    }): Promise<number | null> {
      log.i("updateAgrement - IN", { agrement });

      const agrementToSend: AgrementDto = {
        organismeId: agrement.organismeId ?? organismeId ?? null,
        id: agrement.id ?? null,
        statut: agrement.id
          ? (agrement.statut ?? null)
          : AGREMENT_STATUT.BROUILLON,
        updatedAt: agrement.updatedAt ?? null,
        dateObtentionCertificat: agrement.dateObtentionCertificat ?? null,
        dateObtention: agrement.dateObtention ?? null,
        dateDepot: agrement.dateDepot ?? null,
        dateVerifCompleture: agrement.dateVerifCompleture ?? null,
        dateConfirmCompletude: agrement.dateConfirmCompletude ?? null,
        commentaire: agrement.commentaire ?? null,
        motivations: agrement.motivations ?? null,
        immatriculation: agrement.immatriculation ?? null,
        sejourNbEnvisage: agrement.sejourNbEnvisage ?? null,
        sejourCommentaire: agrement.sejourCommentaire ?? null,
        sejourTypeHandicap: agrement.sejourTypeHandicap ?? null,
        vacanciersNbEnvisage: agrement.vacanciersNbEnvisage ?? null,
        animationAutre: agrement.animationAutre ?? null,
        accompRespNb: agrement.accompRespNb ?? null,
        accompRespCompExp: agrement.accompRespCompExp ?? null,
        accompRespRecruteUrg: agrement.accompRespRecruteUrg ?? null,
        accompRespAttestHono: agrement.accompRespAttestHono ?? null,
        transportAllerRetour: agrement.transportAllerRetour ?? null,
        transportSejour: agrement.transportSejour ?? null,
        suiviMedDistribution: agrement.suiviMedDistribution ?? null,
        suiviMedAccordSejour: agrement.suiviMedAccordSejour ?? null,
        protocoleEvacUrg: agrement.protocoleEvacUrg ?? null,
        protocoleRapatUrg: agrement.protocoleRapatUrg ?? null,
        protocoleRapatEtranger: agrement.protocoleRapatEtranger ?? null,
        protocoleMateriel: agrement.protocoleMateriel ?? null,
        protocoleInfoFamille: agrement.protocoleInfoFamille ?? null,
        protocoleRemboursement: agrement.protocoleRemboursement ?? null,
        budgetGestionPerso: agrement.budgetGestionPerso ?? null,
        budgetPersoGestionComplementaire:
          agrement.budgetPersoGestionComplementaire ?? null,
        budgetPaiementSecurise: agrement.budgetPaiementSecurise ?? null,
        budgetComplement: agrement.budgetComplement ?? null,
        bilanAucunChangementEvolution:
          agrement.bilanAucunChangementEvolution ?? null,
        bilanChangementEvolution: agrement.bilanChangementEvolution ?? null,
        bilanQualPerceptionSensibilite:
          agrement.bilanQualPerceptionSensibilite ?? null,
        bilanQualPerspectiveEvol: agrement.bilanQualPerspectiveEvol ?? null,
        bilanQualElementsMarquants: agrement.bilanQualElementsMarquants ?? null,
        bilanFinancierComptabilite: agrement.bilanFinancierComptabilite ?? null,
        bilanFinancierComparatif: agrement.bilanFinancierComparatif ?? null,
        bilanFinancierRessourcesHumaines:
          agrement.bilanFinancierRessourcesHumaines ?? null,
        bilanFinancierCommentaire: agrement.bilanFinancierCommentaire ?? null,
        agrementAnimation: agrement.agrementAnimation ?? undefined,
        agrementFiles: agrement.agrementFiles ?? undefined,
        agrementSejours: agrement.agrementSejours ?? undefined,
        agrementBilanAnnuel: agrement.agrementBilanAnnuel ?? undefined,
        regionObtention: agrement.regionObtention ?? null,
        numero: agrement.numero ?? null,
        file: agrement.file ?? null,
      };

      const agrementId: number | null =
        await AgrementService.postAgrement(agrementToSend);

      this.agrementEnTraitement = {
        ...agrementToSend,
        id: agrementToSend.id ?? agrementId ?? null,
      };
      log.i("updateAgrement - DONE", { agrementId });
      return agrementId;
    },
    async getAllActivites(): Promise<void> {
      log.i("getAllActivites - IN");
      try {
        const activites: ActiviteDto[] = await AgrementService.getAllActivies();
        this.activites = activites;
        log.i("getAllActivites - DONE");
      } catch (err) {
        log.w("getAllActivites - DONE with error", err);
        throw err;
      }
    },
    async getHistory(agrementId: number): Promise<void> {
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
        if (success && this.agrementEnTraitement?.id === agrementId) {
          this.agrementEnTraitement.statut = statut;
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
