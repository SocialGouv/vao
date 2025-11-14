import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";
import type { AgrementDto } from "@vao/shared-bridge";
import { AGREMENT_STATUT } from "@vao/shared-bridge";

const log = logger("stores/agrement");

export const useAgrementStore = defineStore("agrement", {
  state: () => ({
    agrement: {} as AgrementDto,
    agrementCourant: {} as AgrementDto,
  }),
  actions: {
    async getByOrganismeId(organismeId: number) {
      log.i("getByOrganismeId - IN");
      try {
        const result = await $fetchBackend(
          `/agrements/organisme/${organismeId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        log.i("getByOrganismeId - DONE");
        this.agrementCourant = result.agrement;
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

      const url = "/agrements/";

      const { agrementId } = await $fetchBackend(url, {
        method: "POST",
        body: agrement,
        credentials: "include",
      });

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
  },
});
