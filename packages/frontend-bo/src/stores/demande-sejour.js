import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";
import { getMonth } from "date-fns/getMonth";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
  }),
  getters: {
    saison: (state) => {
      return (stateId) => {
        const demande = state.demandes.find((d) => d.id === stateId);
        if (demande?.dateDebut) {
          const moisDebut = getMonth(demande.dateDebut);
          if (moisDebut < 3) return "Hiver";
          if (moisDebut < 6) return "Printemps";
          if (moisDebut < 9) return "Eté";
          if (moisDebut < 12) return "Automne";
        }
      };
    },
    organismeTitle: (state) => (stateId) => {
      const demande = state.demandes.find((d) => d.id === stateId);
      if (demande?.personne_physique) {
        return `${demande.personne_physique.prenom} ${demande.personne_physique.nomUsage}`;
      }
      if (demande?.personne_morale) {
        return demande.personne_morale.raisonSociale;
      }
    },
  },
  actions: {
    async fetchDemandes() {
      log.i("fetchDemandes - IN");
      try {
        const { demandes } = await $fetchBackend("/sejour/admin", {
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
  },
});
