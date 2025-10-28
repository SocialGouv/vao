import { defineStore } from "pinia";
import { $fetchBackend, logger } from "#imports";

const log = logger("stores/agrement");

export const useAgrementStore = defineStore("agrement", {
  state: () => ({
    personnePhysique: {
      id: 1,
      prenom: "Olivier",
      nom: "Dupont",
      profession: "Développeur",
      telephone: "0675892345",
      email: "ola@test.com",
      adresseSiege: "123 Rue de la République, 75001 Paris",
      adresseActivites: "456 Avenue des Champs-Élysées, 75008 Paris",
    },
    personneMorale: {
      id: 2,
      denominationSociale: "denomination sociale",
      formeJuridique: "forme juridique blabla",
      statutOrganisme: "statut organisme blabla",
      telephone: "0123456789",
      email: "contact@lesamis.org",
      adresseSiege: "10 Avenue de la Liberté, 75002 Paris",
      prenom: "Jean",
      nom: "Durand",
    },
    commentaire: "",
    representants: [
      {
        prenom: "Jean",
        nom: "Durand",
        telephoneRepresentant: "0612345678",
        emailRepresentant: "jean.durand@lesamis.org",
        adresseDomicile: {
          label: "5 Rue des Fleurs, 75003 Paris",
          code_insee: "75110",
          code_postal: "75003",
          long: "2.362272",
          lat: "48.876064",
          departement: "75",
        },
      },
      {
        prenom: "Pierre",
        nom: "Michel",
        telephoneRepresentant: "0612345678",
        emailRepresentant: "pierre.durand@lesamis.org",
        adresseDomicile: {
          label: "5 Rue des Fleurs, 75003 Paris",
          code_insee: "75110",
          code_postal: "75003",
          long: "2.362272",
          lat: "48.876064",
          departement: "75",
        },
      },
    ],
  }),
  actions: {
    async fetchPersonnePhysique(id) {
      log.i("fetchPersonnePhysique - IN");
      try {
        const { personne } = await $fetchBackend(
          `/agrement/personne-physique/${id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (personne) {
          this.personnePhysique = personne;
        }
      } catch (err) {
        log.w("fetchPersonnePhysique - DONE with error", err);
        this.personnePhysique = {};
        throw err;
      }
    },
    async updateRepresentants(representants) {
      log.i("updateRepresentants - IN", representants);
      if (Array.isArray(representants)) {
        this.representants = representants;
      }
    },
    async updatePersonneMorale(id, data) {
      log.i("updatePersonneMorale - IN");
      console.log("Updating personne morale with ID:", id, "and data:", data);
      try {
        this.personneMorale = {
          ...this.personneMorale,
          ...data,
        };
        if (Array.isArray(data.representants)) {
          await this.updateRepresentants(data.representants);
        }
      } catch (err) {
        log.w("updatePersonneMorale - DONE with error", err);
        throw err;
      }
    },
    async updatePersonnePhysique(id, data) {
      log.i("updatePersonnePhysique - IN");
      console.log("Updating personne physique with ID:", id, "and data:", data);
      try {
        this.personnePhysique = { ...data };
        // const { personne } = await $fetchBackend(
        //   `/agrement/personne-physique/${id}`,
        //   {
        //     method: "PUT",
        //     credentials: "include",
        //     body: data,
        //   },
        // );
        // if (personne) {
        //   this.personnePhysique = personne;
        // }
      } catch (err) {
        log.w("updatePersonnePhysique - DONE with error", err);
        throw err;
      }
    },
  },
});
