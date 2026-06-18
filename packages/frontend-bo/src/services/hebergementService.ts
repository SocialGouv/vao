import type { HebergementAdminRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const HebergementService = {
  getHebergement: async (hebergementId: number) => {
    const { hebergement } = await buildRequest<
      HebergementAdminRoutes["GetOne"]
    >({
      path: "/hebergement/admin/{id}",
      method: "GET",
      params: { id: String(hebergementId) },
    })();
    return hebergement;
  },
};

export { HebergementService };
