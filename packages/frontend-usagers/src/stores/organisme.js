import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/organismes");

export const useOrganismeStore = defineStore("organismes", {
  state: () => ({
    organismes: [],
    organismeCourant: null,
    usersFO: [],
  }),
  getters: {
    isSiegeSocial: (state) =>
      state.organismeCourant &&
      state.organismeCourant.typeOrganisme === "personne_morale" &&
      state.organismeCourant.personneMorale.siegeSocial,
  },
  actions: {
    async fetchOrganismes() {
      try {
        log.i("fetchOrganismes - IN");
        const { organismes } = await $fetchBackend("/organisme", {
          credentials: "include",
        });
        if (organismes) {
          this.organismes = organismes;
        }
        log.d("fetchOrganismes - DONE");
      } catch (err) {
        this.organismes = [];
        log.i("fetchOrganismes - DONE with error");
      }
    },
    async fetchUsersOrganisme() {
      log.i("fetchUsersOrganisme - IN");
      try {
        // Appel du back pour la liste des utilisateurs de liés à l'organisme
        const { users } = await $fetchBackend("/fo-user/list", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            search: {
              siret: this.organismeCourant.personneMorale.siret,
            },
          },
        });
        log.d("fetchUsersOrganisme - réponse", { users });
        this.usersFO = users;
        log.i("fetchUsersOrganisme - DONE");
      } catch (error) {
        // Retour vide en cas d'erreur
        this.usersFO = [];
        log.w("fetchUsersOrganisme - Erreur", { error });
      }
    },
    async setMyOrganisme() {
      try {
        const { organisme } = await $fetchBackend(`/organisme`, {
          credentials: "include",
        });

        // TODO : à retirer après que cette api ne renvoie que l'organisme souhaité
        if (!organisme || organisme.length === 0) {
          this.organismeCourant = null;
        } else if (organisme.length) {
          this.organismeCourant = organisme[0];
        } else {
          this.organismeCourant = organisme;
        }
        log.d("setOrganismeCourant - DONE");
      } catch (err) {
        this.organismeCourant = null;
        log.i("setOrganismeCourant - DONE with error");
      }
    },
    async updatePersonneMorale(personneMorale) {
      try {
        this.organismeCourant = {
          ...this.organismeCourant,
          personneMorale: { ...personneMorale },
        };
        log.i("updatePersonneMorale - DONE");
      } catch (err) {
        log.w("updatePersonneMorale - ERROR", { err });
      }
    },
    async updatePersonnePhysique(personnePhysique) {
      //todo put backend
      try {
        this.organismeCourant = {
          ...this.organismeCourant,
          personnePhysique: { ...personnePhysique },
        };
        log.i("updatePersonnePhysique - DONE");
      } catch (err) {
        log.w("updatePersonnePhysique - ERROR", { err });
      }
    },
    // todo: commit changements backend
  },
});
