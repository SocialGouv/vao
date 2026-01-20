import { defineStore } from "pinia";
import type { AgrementDto, ActiviteDto } from "@vao/shared-bridge";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { AgrementService } from "~/services/agrementService";
const log = logger("stores/agrement");

export interface AgrementStoreState {
  agrement: AgrementDto | null;
  agrementCourant: AgrementDto | null;
  activites: ActiviteDto[];
}

export const useAgrementStore = defineStore("agrement", {
  state: (): AgrementStoreState => ({
    agrement: null,
    agrementCourant: null,
    activites: [],
  }),
  actions: {
    async getByOrganismeId(organismeId: number): Promise<void> {
      log.i("getByOrganismeId - IN");
      try {
        const agrement: AgrementDto | null =
          await AgrementService.getByOrganismeId(organismeId);
        log.i("getByOrganismeId - DONE");
        this.agrementCourant = agrement;
      } catch (err) {
        log.w("getByOrganismeId - DONE with error", err);
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
      };

      const agrementId: number | null =
        await AgrementService.postAgrement(agrementToSend);

      this.agrementCourant = {
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
  },
});
