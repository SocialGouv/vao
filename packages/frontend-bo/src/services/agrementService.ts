import type { AgrementAdminRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  getListAgrements: async (params: any) => {
    console.log("AgrementService - loaded", params);
    const { agrements, count } = await buildRequest<
      AgrementAdminRoutes["GetList"]
    >({
      path: "/admin/agrements/list",
      method: "GET",
      query: params,
    })();
    console.log("AgrementService - getListAgrements - agrements", agrements);
    console.log("AgrementService - getListAgrements - count", count);
    return { agrements, count };
  },
};

export { AgrementService };
