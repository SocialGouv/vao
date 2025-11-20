import { defineStore } from "pinia";
import { DocumentService } from "~/services/documentService";
const log = logger("stores/agrement");

export const useDocumentStore = defineStore("document", {
  actions: {
    async postDocument({
      document,
      category,
    }: {
      document: File;
      category?: string;
    }) {
      log.i("postDocument - IN", { document });
      if (document) {
        const uuid = await DocumentService.postDocument({ document, category });
        return uuid;
      }
      return null;
    },
  },
});
