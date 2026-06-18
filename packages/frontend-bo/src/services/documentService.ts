import type { DocumentAdminRoutes } from "@vao/shared-bridge";
import { buildRequestFile } from "~/utils/fetchBackend";

const DocumentService = {
  postDocument: async ({
    file,
    category,
  }: {
    file: File;
    category: DocumentAdminRoutes["PostDocument"]["body"]["category"];
  }) => {
    const { uuid } = await buildRequestFile<
      DocumentAdminRoutes["PostDocument"]
    >({
      path: "/documents/admin",
      method: "POST",
      body: {
        category,
      },
      file,
    })();
    return uuid;
  },
};

export { DocumentService };
