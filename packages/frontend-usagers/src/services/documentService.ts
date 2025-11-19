import type { DocumentUsagersRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const DocumentService = {
  getDocument: async (uuid: string) => {
    const { file } = await buildRequest<DocumentUsagersRoutes["GetOne"]>({
      path: "/documents/{uuid}",
      method: "GET",
      params: { uuid },
    })();
    return file;
  },
  postDocument: async ({
    document,
    category,
  }: {
    document: File;
    category: string;
  }) => {
    const body = new FormData();
    //    console.log("DocumentService.postDocument - IN", document);
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
