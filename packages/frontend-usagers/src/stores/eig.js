import { defineStore } from "pinia";
import { $fetchBackend, getEigPermissions, logger } from "#imports";
import { eigModel } from "@vao/shared";
import { getTagSejourLibelle } from "@vao/shared/src/utils/eigUtils";

const log = logger("stores/hebergement");

export const useEigStore = defineStore("eig", {
  state: () => ({
    eigs: [],
    availableDs: [],
    selectedDemande: null,
    currentEig: null,
    total: 0,
  }),
  getters: {
    canModify() {
      return (
        !this.currentEig ||
        (getEigPermissions.allowEigReadWrite &&
          this.currentEig?.statut === eigModel.Statuts.BROUILLON &&
          getEigPermissions.isDeclarationligibleToEig({
            dateDebut: this.currentEig.dateDebut,
            dateFin: this.currentEig.dateFin,
            statut: this.currentEig.dsStatut,
          }))
      );
    },
    selectedDemandeLabel() {
      if (!this.selectedDemande) {
        return null;
      }
      return getTagSejourLibelle(this.selectedDemande);
    },
    selectedDemandeDateRange() {
      if (!this.selectedDemande) {
        return null;
      }
      return [this.selectedDemande.dateDebut, this.selectedDemande.dateFin];
    },
    departementsOptions() {
      return (
        this.selectedDemande?.hebergement?.hebergements
          ?.map((h) => h?.coordonnees?.adresse?.departement)
          .filter((d) => !!d) ?? []
      );
    },
  },
  actions: {
    async setCurrentEig(eigId) {
      if (!eigId) {
        this.currentEig = null;
      } else {
        log.i("fetchEig for one id - IN");

        try {
          const { eig } = await $fetchBackend(`/eig/${eigId}`, {
            method: "GET",
            credentials: "include",
          });

          this.currentEig = eig;
          log.i("fetchEig for one id - OUT");
        } catch (err) {
          log.w("fetchEig for one id - DONE with error", err);
          this.currentEig = null;
          throw err;
        }
      }
    },
    async get({ limit, offset, sortBy, sortDirection, search } = {}) {
      log.i("fetchEig - IN");
      try {
        const { eig } = await $fetchBackend("/eig/me", {
          method: "GET",
          credentials: "include",
          params: {
            limit,
            offset,
            sortBy,
            sortDirection,
            search,
          },
        });
        this.eigs = eig.eigs;
        this.total = eig.total;
        log.i("fetchEig - OUT");
      } catch (err) {
        log.w("fetchEig for one id - DONE with error", err);
        this.currentEig = null;
        throw err;
      }
    },
    async updateEig(eigId, type, data) {
      try {
        return await $fetchBackend(`/eig/${eigId}`, {
          method: "PUT",
          credentials: "include",
          body: {
            parametre: data,
            type: type,
          },
        });
      } catch (err) {
        log.w("update for one id - DONE with error", err);
        throw err;
      }
    },
    async create(data) {
      try {
        return await $fetchBackend("/eig", {
          method: "POST",
          credentials: "include",
          body: {
            parametre: data,
          },
        });
      } catch (err) {
        log.w("update for one id - DONE with error", err);
        throw err;
      }
    },
    async depose(eigId, body) {
      try {
        return await $fetchBackend(`/eig/depose/${eigId}`, {
          method: "POST",
          credentials: "include",
          body,
        });
      } catch (err) {
        log.w("depose for one id - DONE with error", err);
        throw err;
      }
    },
    async delete(eigId) {
      try {
        await $fetchBackend(`/eig/${eigId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        log.w("update for one id - DONE with error", err);
        throw err;
      }
    },
    async setAvailableDs(search = null) {
      try {
        const res = await $fetchBackend("/eig/available-ds", {
          method: "GET",
          credentials: "include",
          params: { search },
        });

        this.availableDs = res;
      } catch (err) {
        this.availableDs = [];
        log.w("getAvailableDs - DONE with error", err);
        throw err;
      }
    },
    async setSelectedDemande(id) {
      log.i("setSelectedDemande - IN");
      if (!id) {
        this.selectedDemande = null;
        return;
      }

      try {
        const { demande } = await $fetchBackend(`/sejour/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (demande) {
          log.i("setDemandeCourante - DONE");
          this.selectedDemande = demande;
        }
      } catch (err) {
        log.w("setSelectedDemande - DONE with error", err);
        this.selectedDemande = null;
      }
    },
  },
});
