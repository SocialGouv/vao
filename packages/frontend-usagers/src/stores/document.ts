import { defineStore } from "pinia";
import { DocumentService } from "~/services/documentService";
import type { FILE_CATEGORY } from "@vao/shared-bridge";

const log = logger("stores/agrement");

export const useDocumentStore = defineStore("document", {
  actions: {
    async postDocument({
      document,
      category,
    }: {
      document: File;
      category: FILE_CATEGORY;
    }) {
      log.i("postDocument - IN", { document });
      if (!document) {
        throw new Error("Un document est requis pour le chargement");
      }
      const uuid = await DocumentService.postDocument({ file: document, category });
      return uuid;
    },
  },
});
