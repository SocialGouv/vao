import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";
import type { OrganismeDto, UserDto } from "@vao/shared-bridge";

interface OrganismeStoreState {
  organismes: OrganismeDto[];
  organismeCourant: OrganismeDto | null;
  usersFO: UserDto[];
}

const log = logger("stores/organismes");

export const useOrganismeStore = defineStore("organismes", {
  state: (): OrganismeStoreState => ({
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
      } catch {
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
              siret: this.organismeCourant?.personneMorale?.siret,
            },
          },
        });
        log.d("fetchUsersOrganisme - réponse", { users });
        this.usersFO = users;
        log.i("fetchUsersOrganisme - DONE");
      } catch (error: unknown) {
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
      } catch {
        this.organismeCourant = null;
        log.i("setOrganismeCourant - DONE with error");
      }
    },
    async updatePersonne(parametre, type) {
      log.i(`updatePersonne - IN (${type})`, { parametre });
      const organismeId = this.organismeCourant?.organismeId;
      if (!organismeId) throw new Error("Aucun organisme courant sélectionné");
      try {
        await $fetchBackend(`/organisme/${organismeId}`, {
          method: "POST",
          credentials: "include",
          body: {
            parametre,
            type,
          },
        });
        if (type === "personne_morale") {
          this.organismeCourant = {
            ...this.organismeCourant,
            personneMorale: {
              ...this.organismeCourant.personneMorale,
              ...parametre,
            },
          };
        } else if (type === "personne_physique") {
          this.organismeCourant = {
            ...this.organismeCourant,
            personnePhysique: {
              ...this.organismeCourant.personnePhysique,
              ...parametre,
            },
          };
        }
        log.i(`updatePersonne - DONE (${type})`);
      } catch (err) {
        log.w(`updatePersonne - ERROR (${type})`, { err });
        throw err;
      }
    },
    async updatePersonneMorale(personneMorale) {
      return this.updatePersonne(personneMorale, "personne_morale");
    },
    async updatePersonnePhysique(personnePhysique) {
      return this.updatePersonne(personnePhysique, "personne_physique");
    },
    // todo: commit changements backend
  },
});
