import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";

const log = logger("stores/demande-sejour");

const resetDemandeCourante = () => ({
  informationsOperateur: {},
  informationsVacanciers: {},
  informationsPersonnel: {},
  informationsProjetSejour: {},
  informationsTransport: {},
  informationsSanitaires: {},
  hebergement: {},
});

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    demandeCourante: resetDemandeCourante(),
  }),
  actions: {
    async fetchDemandes() {
      log.i("fetchDemandes - IN");
      try {
        const { demandes } = await $fetchBackend("/sejour", {
          method: "GET",
          credentials: "include",
        });
        if (demandes) {
          log.i("fetchDemandes - DONE");
          this.demandes = demandes;
        }
      } catch (err) {
        log.w("fetchDemandes - DONE with error", err);
        this.demandes = [];
      }
    },
    async setDemandeCourante(id) {
      log.i("setDemandeCourante - IN");
      try {
        const { demande } = await $fetchBackend(`/sejour/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (demande) {
          log.i("setDemandeCourante - DONE");
          this.demandeCourante = demande;
        }
      } catch (err) {
        log.w("setDemandeCourante - DONE with error", err);
        this.demandeCourante = resetDemandeCourante();
      }
    },
    async resetDemandeCourante() {
      log.i("resetDemandeCourante - IN");
      this.demandeCourante = resetDemandeCourante();
    },
    async postDemande(demande) {
      log.i("postDemande - IN", { demande });
      try {
        await $fetchBackend(`/demandes-sejour`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(demande),
        });
        log.i("postDemande - DONE");
      } catch (err) {
        log.w("postDemande - DONE with error", err);
      }
    },
  },
});
