import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";
import UploadFile from "~/utils/UploadFile";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: null,
  }),
  actions: {
    async fetchBySiren(siren) {
      try {
        log.i("fetchBySiren - IN");
        const { hebergements } = await $fetchBackend(
          `/hebergement/siren/${siren}`,
          {
            credentials: "include",
          },
        );
        if (hebergements) {
          this.hebergements = hebergements;
        }
        log.d("fetchBySiren  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetchBySiren - DONE with error");
      }
    },
    async fetch(params) {
      try {
        log.i("fetch - IN");
        const { rows, total } = await $fetchBackend("/hebergement", {
          credentials: "include",
          params,
        });

        this.hebergements = rows;
        this.hebergementsTotal = total;
        log.d("fetch  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetch - DONE with error");
      }
    },
    async fetchById(id) {
      try {
        log.i("fetchById - IN", { id });

        const { hebergement } = await $fetchBackend(`/hebergement/${id}`, {
          credentials: "include",
        });
        log.d(hebergement);
        if (hebergement) {
          this.hebergementCourant = hebergement;
        }
        log.d("fetchById - DONE");
      } catch (err) {
        this.hebergementCourant = null;
        log.i("fetchById - DONE with error");
      }
    },
    async updateOrCreate(hebergement, hebergementId) {
      log.i("updateOrCreate - IN", { hebergement });

      const url = hebergementId
        ? `/hebergement/${hebergementId}`
        : `/hebergement`;

      const { id } = await $fetchBackend(url, {
        method: "POST",
        body: hebergement,
        credentials: "include",
      });
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
    async updateOrCreateBrouillon(hebergement, hebergementId) {
      log.i("updateOrCreate - IN", { hebergement });

      const url = hebergementId
        ? `/hebergement/${hebergementId}/brouillon`
        : `/hebergement/brouillon`;

      const { id } = await $fetchBackend(url, {
        method: hebergementId ? "PUT" : "POST",
        body: hebergement,
        credentials: "include",
      });
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
    async activate(hebergement, hebergementId) {
      log.i("updateOrCreate - IN", { hebergement });

      const { id } = await $fetchBackend(
        `/hebergement/${hebergementId}/activate`,
        {
          method: "PUT",
          body: hebergement,
          credentials: "include",
        },
      );
      log.i("updateOrCreate - Done", { id });
      return id ?? hebergementId;
    },
    async desactivate(hebergementId) {
      log.i("desactivate - IN", { hebergementId });

      const { id } = await $fetchBackend(
        `/hebergement/${hebergementId}/desactivate`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      log.i("desactivate - Done", { id });
      return id ?? hebergementId;
    },
    async reactivate(hebergementId) {
      log.i("reactivate - IN", { hebergementId });

      const { id } = await $fetchBackend(
        `/hebergement/${hebergementId}/reactivate`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      log.i("desactivate - Done", { id });
      return id ?? hebergementId;
    },
    async uploadAllFiles(hebergement) {
      const { informationsLocaux } = hebergement;

      const uploadFileIfNeeded = async (key, file, logLabel) => {
        if (file && !file.uuid) {
          try {
            const uuid = await UploadFile(key, file);
            return {
              uuid,
              name: file.name,
              createdAt: new Date(),
            };
          } catch (error) {
            log.w(logLabel, error);
            error.fileName = file?.name;
            throw error;
          }
        }
        return file;
      };

      if (informationsLocaux.reglementationErp) {
        informationsLocaux.fileDerniereAttestationSecurite =
          await uploadFileIfNeeded(
            "attestation_securite",
            informationsLocaux.fileDerniereAttestationSecurite,
            "fileDerniereAttestationSecurite",
          );

        informationsLocaux.fileDernierArreteAutorisationMaire =
          await uploadFileIfNeeded(
            "arrete_autorisation_maire",
            informationsLocaux.fileDernierArreteAutorisationMaire,
            "fileDernierArreteAutorisationMaire",
          );
      } else {
        informationsLocaux.fileReponseExploitantOuProprietaire =
          await uploadFileIfNeeded(
            "reponse_explouprop",
            informationsLocaux.fileReponseExploitantOuProprietaire,
            "fileReponseExploitantOuProprietaire",
          );
      }
    },
  },
});
