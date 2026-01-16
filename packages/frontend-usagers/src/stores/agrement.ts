import { defineStore } from "pinia";
import type { AgrementDto, ActiviteDto } from "@vao/shared-bridge";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { AgrementService } from "~/services/agrementService";
const log = logger("stores/agrement");

export const useAgrementStore = defineStore("agrement", {
  state: () => ({
    agrement: {} as AgrementDto,
    agrementCourant: {} as AgrementDto,
    activites: [] as ActiviteDto[],
  }),
  actions: {
    async getByOrganismeId(organismeId: number) {
      log.i("getByOrganismeId - IN");
      try {
        const agrement = await AgrementService.getByOrganismeId(organismeId);
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
    }) {
      log.i("updateAgrement - IN", { agrement });

      agrement.organismeId = organismeId;
      // Si aucun id => c’est une création donc Brouillon par défaut
      if (!agrement.id) {
        agrement.statut = AGREMENT_STATUT.BROUILLON;
      }
      const agrementId = await AgrementService.postAgrement(agrement);

      this.agrementCourant = {
        id: agrement.id ?? null,
        organismeId: agrement.organismeId ?? null,
        statut: agrement.statut ?? null,
        updatedAt: agrement.updatedAt ?? null,
        dateObtentionCertificat: agrement.dateObtentionCertificat ?? null,
        ...agrement,
      } as AgrementDto;
      log.i("updateAgrement - DONE", { agrementId });
      return agrementId;
    },
    async getAllActivites() {
      log.i("getAllActivites - IN");
      console.log("getAllActivites - IN");
      try {
        const activites = await AgrementService.getAllActivies();
        this.activites = activites;
        console.log("Activités récupérées:", activites);
        log.i("getAllActivites - DONE");
      } catch (err) {
        log.w("getAllActivites - DONE with error", err);
        throw err;
      }
    },
  },
});
