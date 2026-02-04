import type { DocumentUsagersRoutes } from "@vao/shared-bridge";
import { buildRequestFile } from "~/utils/fetchBackend";

const DocumentService = {
  postDocument: async ({
    file,
    category,
  }: { file: File, category: DocumentUsagersRoutes["PostDocument"]["body"]["category"] }) => {

    const { uuid } = await buildRequestFile<
      DocumentUsagersRoutes["PostDocument"]
    >({
      path: "/documents/",
      method: "POST",
      body: {
        category
      },
      file
    })();
    return uuid;
  },
};

export { DocumentService };
