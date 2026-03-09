import type { AgrementAdminRoutes, AGREMENT_STATUT } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  patchStatut: async (agrementId: number, statut: AGREMENT_STATUT) => {
    return await buildRequest<AgrementAdminRoutes["PatchStatut"]>({
      path: "admin/agrements/{agrementId}/statut",
      method: "PATCH",
      params: { agrementId: String(agrementId) },
      body: { statut },
    })();
  },
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
  getById: async (agrementId: number) => {
    const { agrement } = await buildRequest<AgrementAdminRoutes["GetOne"]>({
      path: "/admin/agrements/{agrementId}",
      method: "GET",
      params: { agrementId: String(agrementId) },
    })();
    return agrement;
  },
};

export { AgrementService };
