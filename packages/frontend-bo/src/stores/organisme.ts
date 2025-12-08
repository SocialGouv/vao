import { defineStore } from "pinia";
import { logger, $fetchBackend } from "#imports";
import type { OrganismeDto } from "@vao/shared-bridge";

const log = logger("stores/organisme");

interface OrganismeStoreState {
  organisme: OrganismeDto | null;
  organismes: OrganismeDto[];
  organismesTotal: number;
  organismesNonAgrees: OrganismeDto[];
}

export const useOrganismeStore = defineStore("organisme", {
  state: (): OrganismeStoreState => ({
    organisme: null,
    organismes: [],
    organismesTotal: 0,
    organismesNonAgrees: [],
  }),
  getters: {
    libelle: (state) =>
      state.organisme?.personneMorale?.raisonSociale ??
      `${state.organisme?.personnePhysique?.nomNaissance ?? ""} ${state.organisme?.personnePhysique?.prenom ?? ""}`,
    dateFinValidite: (state) =>
      state.organisme?.agrement?.dateFinValidite
        ? new Date(state.organisme.agrement.dateFinValidite)
        : null,
  },
  actions: {
    async exportOrganismes() {
      log.i("exportOrganismes - IN");
      try {
        const response = await $fetchBackend("/organisme/bo/extract", {
          method: "GET",
          credentials: "include",
        });
        log.i("exportOrganismes - DONE");
        return response;
      } catch (err) {
        log.w("exportOrganismes - DONE with error", err);
        throw err;
      }
    },
    async fetchOrganismes(params: any) {
      try {
        // Appel du back pour la liste des utilisateurs
        const { rows, total } = await $fetchBackend("/organisme/bo/liste", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params,
        });
        this.organismes = rows;
        this.organismesTotal = total;
      } catch (error) {
        this.organismes = [];
        this.organismesTotal = 0;
        throw error;
      }
    },
    async fetchOrganismesNonAgrees({ search }: { search?: string } = {}) {
      log.i("fetchOrganismesNonAgrees - IN");
      try {
        // Appel du back pour la liste des utilisateurs
        const { organismes } = await $fetchBackend("/organisme/bo/nonagrees", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            search,
          },
        });
        log.d("fetchOrganismesNonAgrees - réponse", { organismes });
        this.organismesNonAgrees = organismes;
        log.i("fetchOrganismesNonAgrees - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.organismesNonAgrees = [];
        log.w("fetchOrganismesNonAgrees - Erreur", { error });
      }
    },

    async getOrganisme(id: string) {
      log.i("getOrganisme - IN", { id });
      try {
        // Appel du back pour la liste des utilisateurs
        const organisme = await $fetchBackend("/organisme/bo/" + id, {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        log.d("getOrganisme", { organisme });
        this.organisme = organisme.organisme;
        log.i("getOrganisme - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.organisme = null;
        log.w("getOrganisme - Erreur", { error });
      }
    },
  },
});
