import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";
import { apiModel } from "@vao/shared-ui";

export const useExternalApiStore = defineStore("externalApi", {
  state: () => ({
    apisUnavailable: {},
  }),
  actions: {
    async checkApi(apiType, path) {
      try {
        await $fetchBackend(path);
        this.setApiUnavailable(apiType, false);
      } catch (err) {
        this.setApiUnavailable(apiType, true);
      }
    },
    async checkApiInsee() {
      this.checkApi(apiModel.apiTypes.INSEE, "/siret/check-api-insee");
    },
    async checkApiEntreprise() {
      this.checkApi(
        apiModel.apiTypes.ENTREPRISE,
        "/siret/check-api-entreprise",
      );
    },
    async checkApiAdresse() {
      this.checkApi(apiModel.apiTypes.ADRESSE, "/geo/check-api-adresse");
    },
    setApiUnavailable(apiType, isUnavailable) {
      this.apisUnavailable[apiType] = isUnavailable;
    },
  },
});
