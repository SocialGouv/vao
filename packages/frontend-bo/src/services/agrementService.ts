import type { AgrementAdminRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  getListAgrements: async (params: any) => {
    console.log("AgrementService - loaded", params);
    const { agrements } = await buildRequest<AgrementAdminRoutes["GetList"]>({
      path: "/admin/agrements/list",
      method: "GET",
      query: params,
    })();
    return agrements;
  },
};

export { AgrementService };
