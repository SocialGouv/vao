import type {
  CheckTypeHebergementBody,
  CheckTypeHebergementResponse,
  HebergementUsagersRoutes,
  PatchSiteBody,
  PostSiteBody,
  PostSiteResponse,
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
  checkTypeHebergement: async (
    body: CheckTypeHebergementBody,
  ): Promise<CheckTypeHebergementResponse> => {
    const result = await buildRequest<
      HebergementUsagersRoutes["CheckTypeHebergement"]
    >({
      path: "/hebergement/site/type-hebergement-control",
      method: "POST",
      body,
    })();
    return result;
  },
  postSite: async (site: PostSiteBody): Promise<PostSiteResponse> => {
    return await buildRequest<HebergementUsagersRoutes["PostSite"]>({
      path: "/hebergement/site",
      method: "POST",
      body: site,
    })();
  },
  patchSite: async (siteId: string, body: PatchSiteBody): Promise<void> => {
    await buildRequest<HebergementUsagersRoutes["PatchSite"]>({
      path: "/hebergement/site/{siteId}",
      method: "PATCH",
      params: { siteId },
      body,
    })();
  },
};

export { HebergementService };
