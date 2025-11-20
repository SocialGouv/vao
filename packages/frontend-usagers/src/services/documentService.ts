import type { DocumentUsagersRoutes } from "@vao/shared-bridge";
import { buildRequestFile } from "~/utils/fetchBackend";

const DocumentService = {
  postDocument: async ({
    document,
    category,
  }: DocumentUsagersRoutes["PostDocument"]["body"]) => {
    const body = new FormData();
    body.append("category", category);
    body.append("file", document);
    const { uuid } = await buildRequestFile<
      DocumentUsagersRoutes["PostDocument"]
    >({
      path: "/documents/",
      method: "POST",
      body,
    })();
    return uuid;
  },
};

export { DocumentService };
