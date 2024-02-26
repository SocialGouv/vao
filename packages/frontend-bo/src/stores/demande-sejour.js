import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";
import { getMonth } from "date-fns/getMonth";

const log = logger("stores/demande-sejour");

export const useDemandeSejourStore = defineStore("demandeSejour", {
  state: () => ({
    demandes: [],
    total: 0,
  }),
  getters: {
    getById: (state) => (stateId) =>
      state.demandes.find((d) => d.demandeSejourId === parseInt(stateId)),
    saison: (state) => {
      return (stateId) => {
        const demande = state.demandes.find(
          (d) => d.demandeSejourId === stateId,
        );
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
      const demande = state.demandes.find((d) => d.demandeSejourId === stateId);

      if (
        demande?.personne_physique &&
        Object.keys(demande?.personne_physique).length
      ) {
        return `${demande.personne_physique.prenom} ${demande.personne_physique.nomUsage}`;
      }
      if (
        demande?.personne_morale &&
        Object.keys(demande.personne_morale).length
      ) {
        return demande.personne_morale.raisonSociale;
      }
    },
  },
  actions: {
    async fetchDemandes({ limit, offset, sortBy, sortDirection, search } = {}) {
      log.i("fetchDemandes - IN");
      try {
        const { demandesWithPagination } = await $fetchBackend(
          "/sejour/admin",
          {
            method: "GET",
            credentials: "include",
            params: {
              limit,
              offset,
              sortBy,
              sortDirection,
              search,
            },
          },
        );

        if (demandesWithPagination) {
          log.i("fetchDemandes - DONE");
          this.demandes = demandesWithPagination.demandes_sejour;
          this.total = parseInt(demandesWithPagination.total);
        }
      } catch (err) {
        log.w("fetchDemandes - DONE with error", err);
        this.demandes = [];
      }
    },
  },
});
