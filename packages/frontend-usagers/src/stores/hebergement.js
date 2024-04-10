import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/hebergement");

export const useHebergementStore = defineStore("hebergement", {
  state: () => ({
    hebergements: [],
    hebergementCourant: null,
  }),
  actions: {
    async fetchHebergements() {
      try {
        log.i("fetchHebergements - IN");
        const { hebergements } = await $fetchBackend("/hebergement", {
          credentials: "include",
        });
        if (hebergements) {
          this.hebergements = hebergements;
        }
        log.d("fetchHebergements  - DONE");
      } catch (err) {
        this.hebergements = [];
        log.i("fetchHebergements - DONE with error");
      }
    },
    async fetchHebergement(id) {
      try {
        log.i("fetchHebergement - IN", { id });

        const { hebergement } = await $fetchBackend(`/hebergement/${id}`, {
          credentials: "include",
        });
        log.d(hebergement);
        if (hebergement) {
          this.hebergementCourant = hebergement;
        }
        log.d("fetchHebergement - DONE");
      } catch (err) {
        this.hebergementCourant = null;
        log.i("fetchHebergement - DONE with error");
      }
    },
    async addHebergement(hebergement) {
      log.i("addHebergement - IN", { hebergement });
      // Recopie de la branche informationsLocaux (pour pouvoir modifier la partie file à l'enregistrement)
      let updatedInformationsLocaux = { ...hebergement.informationsLocaux };

      if (hebergement.informationsLocaux.reglementationErp === true) {
        const fileDAS = hebergement.informationsLocaux.fileDerniereAttestationSecurite;
        // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
        if (!fileDAS.uuid) {
          try {
            const uuid = await UploadFile("attestation_securite", fileDAS);
            //mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
            updatedInformationsLocaux.fileDerniereAttestationSecurite = {
              uuid,
              name: fileDAS.name,
              createdAt: new Date(),
            };
          } catch (error) {
            if (error.response.status === 413) {
              return toaster.error(
                `Le fichier ${fileDAS.name} dépasse la taille maximale autorisée`,
              );
            }
            log.w("fileDerniereAttestationSecurite", error);
            return toaster.error(
              `Une erreur est survenue lors du dépôt du document ${fileDAS.name}`,
            );
          }
        }

        const fileAAM = hebergement.informationsLocaux.fileDernierArreteAutorisationMaire;
        // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
        if (!fileAAM.uuid) {
          try {
            const uuid = await UploadFile("arrete_autorisation_maire", fileAAM);
            //mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
            updatedInformationsLocaux.fileDernierArreteAutorisationMaire = {
              uuid,
              name: fileAAM.name,
              createdAt: new Date(),
            };
          } catch (error) {
            if (error.response.status === 413) {
              return toaster.error(
                `Le fichier ${fileAAM.name} dépasse la taille maximale autorisée`,
              );
            }
            log.w("fileDernierArreteAutorisationMaire", error);
            return toaster.error(
              `Une erreur est survenue lors du dépôt du document ${fileAAM.name}`,
            );
          }
        }    
      }
      else
      {
        const fileREP = hebergement.informationsLocaux.fileReponseExploitantOuProprietaire;
        // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
        if (!fileREP.uuid) {
          try {
            const uuid = await UploadFile("reponse_explouprop", fileREP);
            //mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
            updatedInformationsLocaux.fileReponseExploitantOuProprietaire = {
              uuid,
              name: fileREP.name,
              createdAt: new Date(),
            };
          } catch (error) {
            if (error.response.status === 413) {
              return toaster.error(
                `Le fichier ${fileREP.name} dépasse la taille maximale autorisée`,
              );
            }
            log.w("fileReponseExploitantOuProprietaire", error);
            return toaster.error(
              `Une erreur est survenue lors du dépôt du document ${fileREP.name}`,
            );
          }
        }  
      }
      let majHerbergement = { ...hebergement, informationsLocaux: updatedInformationsLocaux };

      const url = `/hebergement`;
      const { id } = await $fetchBackend(url, {
        method: "POST",
        body: majHerbergement,
        credentials: "include",
      });
      log.i("addHebergement - Done", { id });
      return id;
    },
  },
});
