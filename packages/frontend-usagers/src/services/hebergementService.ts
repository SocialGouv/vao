import type { HebergementUsagersRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const HebergementService = {
  getHebergement: async (hebergementId: number) => {
    const { hebergement } = await buildRequest<
      HebergementUsagersRoutes["GetOne"]
    >({
      path: "/hebergement/{id}",
      method: "GET",
      params: { id: String(hebergementId) },
    })();
    return hebergement;
  },
};

export { HebergementService };
