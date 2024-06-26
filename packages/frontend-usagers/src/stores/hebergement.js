import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";
import UploadFile from "~/utils/UploadFile";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: null,
  }),
  actions: {
    async fetch() {
      try {
        log.i("fetch - IN");
        const { hebergements } = await $fetchBackend("/hebergement", {
          credentials: "include",
        });
        if (hebergements) {
          this.hebergements = hebergements;
        }
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

    async updaloadFiles(hebergement) {
      if (hebergement.informationsLocaux.reglementationErp) {
        const fileDAS =
          hebergement.informationsLocaux.fileDerniereAttestationSecurite;
        // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
        if (fileDAS && !fileDAS.uuid) {
          try {
            // eslint-disable-next-line no-undef
            const uuid = await UploadFile("attestation_securite", fileDAS);
            // mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
            hebergement.informationsLocaux.fileDerniereAttestationSecurite = {
              uuid,
              name: fileDAS.name,
              createdAt: new Date(),
            };
          } catch (error) {
            log.w("fileDerniereAttestationSecurite", error);
            if (error.response?.status === 413) {
              throw new Error(
                `Le fichier ${fileDAS.name} dépasse la taille maximale autorisée`,
              );
            } else {
              throw new Error(
                `Une erreur est survenue lors du dépôt du document ${fileDAS.name}`,
              );
            }
          }
        }

        const fileAAM =
          hebergement.informationsLocaux.fileDernierArreteAutorisationMaire;
        // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
        if (fileAAM && !fileAAM.uuid) {
          try {
            const uuid = await UploadFile("arrete_autorisation_maire", fileAAM);
            // mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
            hebergement.informationsLocaux.fileDernierArreteAutorisationMaire =
              {
                uuid,
                name: fileAAM.name,
                createdAt: new Date(),
              };
          } catch (error) {
            log.w("fileDernierArreteAutorisationMaire", error);
            if (error.response.status === 413) {
              throw new Error(
                `Le fichier ${fileAAM.name} dépasse la taille maximale autorisée`,
              );
            } else {
              throw new Error(
                `Une erreur est survenue lors du dépôt du document ${fileAAM.name}`,
              );
            }
          }
        }
      } else {
        const fileREP =
          hebergement.informationsLocaux.fileReponseExploitantOuProprietaire;
        // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
        if (fileREP && !fileREP.uuid) {
          try {
            const uuid = await UploadFile("reponse_explouprop", fileREP);
            // mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
            hebergement.informationsLocaux.fileReponseExploitantOuProprietaire =
              {
                uuid,
                name: fileREP.name,
                createdAt: new Date(),
              };
          } catch (error) {
            log.w("fileReponseExploitantOuProprietaire", error);
            if (error.response.status === 413) {
              throw new Error(
                `Le fichier ${fileREP.name} dépasse la taille maximale autorisée`,
              );
            } else {
              throw new Error(
                `Une erreur est survenue lors du dépôt du document ${fileREP.name}`,
              );
            }
          }
        }
      }
    },
  },
});
