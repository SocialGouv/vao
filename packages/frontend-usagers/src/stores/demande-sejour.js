import { defineStore } from "pinia";
import { useRuntimeConfig, useFetch } from "#app";
import { logger } from "#imports";

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
      log.i("fetchDemandes - IN");
      const config = useRuntimeConfig();
      const { data, error } = await useFetch(
        config.public.backendUrl + "/sejour",
      );
      if (data.value) {
        log.i("fetchDemandes - DONE");
        this.demandes = data.value.demandes;
      }
      if (error.value) {
        log.w("fetchDemandes - DONE with error", error.value);
        this.demandes = [];
      }
    },
    async setDemandeCourante(id) {
      log.i("setDemandeCourante - IN");
      const config = useRuntimeConfig();
      const { data, error } = await useFetch(
        `${config.public.backendUrl}/sejour/${id}`,
      );
      if (data.value) {
        log.i("setDemandeCourante - DONE");
        this.demandeCourante = data.value.demande;
      }
      if (error.value) {
        log.w("setDemandeCourante - DONE with error", error.value);
        this.demandeCourante = {};
      }
    },
    async postDemande(demande) {
      log.i("postDemande - IN", { demande });
      const config = useRuntimeConfig();
      const { data, error } = await useFetch(
        `${config.public.backendUrl}/demandes-sejour`,
        { body: JSON.stringify(demande) },
      );
      if (data.value) {
        log.i("postDemande - DONE");
      }
      if (error.value) {
        log.w("postDemande - DONE with error", error.value);
      }
    },
  },
});
