import { defineStore } from "pinia";
import {
  $fetchBackend,
  getEigPermissions,
  isDeclarationligibleToEig,
  logger,
} from "#imports";
import { eigModel } from "@vao/shared-ui";
import { getTagSejourLibelle } from "@vao/shared-ui/src/utils/eigUtils";

const log = logger("stores/hebergement");

interface EigStoreState {
  eigs: any[];
  availableDs: any[];
  selectedDemande: any | null;
  currentEig: any | null;
  total: number;
}

export const useEigStore = defineStore("eig", {
  state: (): EigStoreState => ({
    eigs: [],
    availableDs: [],
    selectedDemande: null,
    currentEig: null,
    total: 0,
  }),
  getters: {
    canModify(): boolean {
      const allowEigReadWrite = getEigPermissions();
      return (
        !this.currentEig ||
        (allowEigReadWrite &&
          this.currentEig?.statut === eigModel.Statuts.BROUILLON &&
          isDeclarationligibleToEig({
            dateDebut: this.currentEig.dateDebut,
            dateFin: this.currentEig.dateFin,
            statut: this.currentEig.dsStatut,
          }))
      );
    },
    selectedDemandeLabel(): string | null {
      if (!this.selectedDemande) {
        return null;
      }
      return getTagSejourLibelle(this.selectedDemande);
    },
    selectedDemandeDateRange(): [string, string] | null {
      if (!this.selectedDemande) {
        return null;
      }
      return [this.selectedDemande.dateDebut, this.selectedDemande.dateFin];
    },
    departementsOptions(): string[] {
      return (
        this.selectedDemande?.hebergement?.hebergements
          ?.map(
            (hebergement: any) =>
              hebergement?.coordonnees?.adresse?.departement,
          )
          .filter((departement: any) => !!departement) ?? []
      );
    },
  },
  actions: {
    async setCurrentEig(eigId: string) {
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
    async get({
      limit,
      offset,
      sortBy,
      sortDirection,
      search,
    }: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: string;
      search?: any;
    } = {}) {
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
    async updateEig(eigId: string, type: string, data: any) {
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
    async create(data: any) {
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
    async depose(eigId: string, body: any) {
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
    async delete(eigId: string) {
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
    async setSelectedDemande(id: number) {
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
