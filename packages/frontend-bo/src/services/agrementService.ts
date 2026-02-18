import type { AgrementAdminRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  getListAgrements: async (params: AgrementAdminRoutes["GetList"]["query"]) => {
    const { agrements, count } = await buildRequest<
      AgrementAdminRoutes["GetList"]
    >({
      path: "/admin/agrements/list",
      method: "GET",
      query: params,
    })();
    return { agrements, count };
  },
};

export { AgrementService };
