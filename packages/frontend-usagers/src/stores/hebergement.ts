import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";
import uploadFile from "~/utils/UploadFile";
import type { HebergementDto } from "@vao/shared-bridge";
import { HebergementService } from "~/services/hebergementService";

const log = logger("stores/hebergement");

type IdResponse = { id?: number };
type HebergementsBySirenResponse = { hebergements?: HebergementDto[] };
type HebergementsListResponse = { rows: HebergementDto[]; total: number };

interface HebergementStoreState {
  hebergements: HebergementDto[];
  hebergementsTotal: number;
  hebergementCourant: HebergementDto | null;
}

export const useHebergementStore = defineStore("hebergement", {
  state: (): HebergementStoreState => ({
    hebergements: [],
    hebergementsTotal: 0,
    hebergementCourant: null,
  }),
  actions: {
    async fetchBySiren(siren: string) {
      try {
        log.i("fetchBySiren - IN");
        const { hebergements } = (await $fetchBackend(
          `/hebergement/siren/${siren}`,
          {
            credentials: "include",
          },
        )) as HebergementsBySirenResponse;
        if (hebergements) {
          this.hebergements = hebergements;
        }
        log.d("fetchBySiren  - DONE");
      } catch (err: unknown) {
        this.hebergements = [];
        log.i("fetchBySiren - DONE with error", err);
      }
    },
    async fetch(params = {}) {
      try {
        log.i("fetch - IN");
        const { rows, total } = (await $fetchBackend("/hebergement", {
          credentials: "include",
          params,
        })) as HebergementsListResponse;

        this.hebergements = rows;
        this.hebergementsTotal = total;
        log.d("fetch  - DONE");
      } catch (err: unknown) {
        this.hebergements = [];
        log.i("fetch - DONE with error", err);
      }
    },
    async fetchById(id: number) {
      try {
        log.i("fetchById - IN", { id });

        const hebergement = await HebergementService.getHebergement(id);
        log.d(hebergement);
        if (hebergement) {
          this.hebergementCourant = hebergement;
        }
        log.d("fetchById - DONE");
      } catch (err: unknown) {
        this.hebergementCourant = null;
        log.i("fetchById - DONE with error", err);
      }
    },
    async updateOrCreate(
      hebergement: Record<string, unknown>,
      hebergementId: number,
    ) {
      log.i("updateOrCreate - IN", { hebergement });

      const url = hebergementId
        ? `/hebergement/${hebergementId}`
        : `/hebergement`;

      const { id } = (await $fetchBackend(url, {
        method: "POST",
        body: hebergement,
        credentials: "include",
      })) as IdResponse;
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
    async updateOrCreateBrouillon(
      hebergement: Record<string, unknown>,
      hebergementId: number,
    ) {
      log.i("updateOrCreate - IN", { hebergement });

      const url = hebergementId
        ? `/hebergement/${hebergementId}/brouillon`
        : `/hebergement/brouillon`;

      const { id } = (await $fetchBackend(url, {
        method: hebergementId ? "PUT" : "POST",
        body: hebergement,
        credentials: "include",
      })) as IdResponse;
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
    async activate(
      hebergement: Record<string, unknown>,
      hebergementId: number,
    ) {
      log.i("updateOrCreate - IN", { hebergement });

      const { id } = (await $fetchBackend(
        `/hebergement/${hebergementId}/activate`,
        {
          method: "PUT",
          body: hebergement,
          credentials: "include",
        },
      )) as IdResponse;
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
    async desactivate(hebergementId: number) {
      log.i("desactivate - IN", { hebergementId });

      const { id } = (await $fetchBackend(
        `/hebergement/${hebergementId}/desactivate`,
        {
          method: "PUT",
          credentials: "include",
        },
      )) as IdResponse;
      log.i("desactivate - Done", { id });
      return id ?? hebergementId;
    },
    async reactivate(hebergementId: number) {
      log.i("reactivate - IN", { hebergementId });

      const { id } = (await $fetchBackend(
        `/hebergement/${hebergementId}/reactivate`,
        {
          method: "PUT",
          credentials: "include",
        },
      )) as IdResponse;
      log.i("desactivate - Done", { id });
      return id ?? hebergementId;
    },
    async uploadAllFiles(hebergement: Record<string, unknown>) {
      const { informationsLocaux } = hebergement;

      if (!informationsLocaux || typeof informationsLocaux !== "object") {
        return;
      }

      const uploadFileIfNeeded = async (
        fieldName: string,
        file: Record<string, unknown> | null,
        logLabel: string,
      ) => {
        if (file && !file.uuid) {
          try {
            const uploadedFileId = await uploadFile(
              fieldName,
              file as unknown as File,
            );
            return {
              uuid: uploadedFileId,
              name: file.name,
              createdAt: new Date(),
            };
          } catch (error: unknown) {
            log.w(logLabel, error);
            throw error;
          }
        }
        return file;
      };

      const locaux = informationsLocaux as Record<string, unknown>;
      if (locaux.reglementationErp) {
        locaux.fileDerniereAttestationSecurite = await uploadFileIfNeeded(
          "attestation_securite",
          (locaux.fileDerniereAttestationSecurite as Record<
            string,
            unknown
          > | null) ?? null,
          "fileDerniereAttestationSecurite",
        );

        locaux.fileDernierArreteAutorisationMaire = await uploadFileIfNeeded(
          "arrete_autorisation_maire",
          (locaux.fileDernierArreteAutorisationMaire as Record<
            string,
            unknown
          > | null) ?? null,
          "fileDernierArreteAutorisationMaire",
        );
      } else {
        locaux.fileReponseExploitantOuProprietaire = await uploadFileIfNeeded(
          "reponse_explouprop",
          (locaux.fileReponseExploitantOuProprietaire as Record<
            string,
            unknown
          > | null) ?? null,
          "fileReponseExploitantOuProprietaire",
        );
      }
    },
  },
});
