import { defineStore } from "pinia";
import { $fetchBackend } from "#imports";
import { apiModel } from "@vao/shared-ui";

interface ExternalApiStoreState {
  apisUnavailable: Record<string, boolean>;
}

export const useExternalApiStore = defineStore("externalApi", {
  state: (): ExternalApiStoreState => ({
    apisUnavailable: {},
  }),
  actions: {
    async checkApi(apiType: string, path: string) {
      try {
        await $fetchBackend(path);
        this.setApiUnavailable(apiType, false);
      } catch {
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
    setApiUnavailable(apiType: string, isUnavailable: boolean) {
      this.apisUnavailable[apiType] = isUnavailable;
    },
  },
});
