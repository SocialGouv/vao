import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";
import { apiModel } from "@vao/shared";

export const useExternalApiStore = defineStore("externalApi", {
  state: () => ({
    apisUnavailable: {},
  }),
  actions: {
    async checkApi(apiType, path) {
      try {
        await $fetchBackend(path);
        this.setApiUnavailable(apiType, false);
        return true;
      } catch (err) {
        this.setApiUnavailable(apiType, true);
        return false;
      }
    },
    async checkApiInsee() {
      return this.checkApi(apiModel.apiTypes.INSEE, "/siret/check-api-insee");
    },
    async checkApiEntreprise() {
      return this.checkApi(
        apiModel.apiTypes.ENTREPRISE,
        "/siret/check-api-entreprise",
      );
    },
    async checkApiAdresse() {
      return this.checkApi(apiModel.apiTypes.ADRESSE, "/geo/check-api-adresse");
    },
    setApiUnavailable(apiType, isUnavailable) {
      this.apisUnavailable[apiType] = isUnavailable;
    },
  },
});
