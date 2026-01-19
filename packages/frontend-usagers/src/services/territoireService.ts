import type { TerritoireUsagersRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const TerritoireService = {
  getTerritoire: async () => {
    console.log("IN TerritoireService.getTerritoire");
    const { territoire } = await buildRequest<
      TerritoireUsagersRoutes["GetByAgrementRegionUser"]
    >({
      path: "/territoire/get-by-agrement-region-user",
      method: "GET",
    })();
    console.log("OUT TerritoireService.getTerritoire", territoire);
    return territoire;
  },
};

export { TerritoireService };
