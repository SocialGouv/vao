import type {
  CheckTypeHebergementBody,
  CheckTypeHebergementResponse,
  HebergementUsagersRoutes,
  PatchSiteBody,
  PostSiteBody,
  PostSiteResponse,
  PostUniteHebergementBody,
  PatchUniteHebergementBody,
  SiteDto,
  UniteHebergementDto,
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
  getSite: async (
    siteId: string,
    organismeId: number,
  ): Promise<{ site: PostSiteResponse | null; unitesHebergement: UniteHebergementDto[] }> => {
    return await buildRequest<HebergementUsagersRoutes["GetSite"]>({
      path: "/hebergement/site/{siteId}",
      method: "GET",
      params: { siteId },
      query: { organismeId },
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
  createUniteHebergement: async (
    siteId: string,
    body: PostUniteHebergementBody,
  ): Promise<UniteHebergementDto> => {
    return await buildRequest<
      HebergementUsagersRoutes["PostUniteHebergement"]
    >({
      path: "/hebergement/site/{siteId}/unites",
      method: "POST",
      params: { siteId },
      body,
    })();
  },
  updateUniteHebergement: async (
    siteId: string,
    uniteId: number,
    organismeId: number,
    body: PatchUniteHebergementBody,
  ): Promise<UniteHebergementDto> => {
    return await buildRequest<
      HebergementUsagersRoutes["PatchUniteHebergement"]
    >({
      path: "/hebergement/site/{siteId}/unites/{uniteId}",
      method: "PATCH",
      params: { siteId, uniteId: String(uniteId) },
      query: { organismeId },
      body,
    })();
  },
};

export { HebergementService };
