import { defineStore } from "pinia";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    demandeCourante: {
      id: null,
      statut: null,
      userId: null,
      operateurId: null,
      siret: null,
      idFonctionnelle: null,
      libelle: null,
      dateDebut: null,
      dateFin: null,
      sejourItinerant: null,
      sejourEtranger: null,
      duree: null,
      informationsOperateur: {},
      informationsVacanciers: {},
      informationsPersonnel: {},
      informationsProjetSejour: {},
      informationsTransport: {},
      informationsSanitaires: {},
      hebergement: [],
    },
  }),
  actions: {
    async fetchDemandes() {
      try {
        log.i("fetchDemandes - IN");

        const response = await $fetch("/front-server/sejour");
        const demandes = response.demandes;
        this.demandes = demandes;
        log.d("fetchDemandes - DONE");
      } catch (err) {
        this.requests = [];
        log.i("fetchDemandes - DONE with error");
      }
    },
    async setDemandeCourante(id) {
      try {
        log.i("setDemandeCourante - IN", { id });

        const response = await $fetch(`/front-server/sejour/${id}`);
        log.d(response);
        this.demandeCourante = response.demande;
        log.d("setDemandeCourante - DONE");
      } catch (err) {
        this.demandeCourante = {};
        log.i("setDemandeCourante - DONE with error");
      }
    },
    async postDemande(demande) {
      try {
        log.i("postDemande - IN", { demande });

        const response = await $fetch(`/front-server/demandes-sejour/`);
        log.d(response);
        const idDemande = response.demande;
        log.d("postDemande - DONE", idDemande);
      } catch (err) {
        log.i("postDemande - DONE with error");
      }
    },
  },
});
