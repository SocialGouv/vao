import type { TerritoireUsagersRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const TerritoireService = {
  getTerritoire: async () => {
    const { territoire } = await buildRequest<
      TerritoireUsagersRoutes["GetByAgrementRegionUser"]
    >({
      path: "/territoire/get-by-agrement-region-user/",
      method: "GET",
    })();
    return territoire;
  },
};

export { TerritoireService };
