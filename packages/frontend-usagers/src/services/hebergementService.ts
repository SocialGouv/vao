import type {
  HebergementUsagersRoutes,
  SiteDto,
} from "@vao/shared-bridge";
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
  checkSiteSimilarites: async (site: SiteDto) => {
    const { similarites } = await buildRequest<
      HebergementUsagersRoutes["CheckSimilarites"]
    >({
      path: "/hebergement/site/similarites",
      method: "POST",
      body: site,
    })();
    return similarites;
  },
};

export { HebergementService };
