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
      path: "/admin/agrements",
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
  getHistory: async (agrementId: string) => {
    const history = await buildRequest<AgrementAdminRoutes["GetHistory"]>({
      path: "/admin/agrements/history/{agrementId}",
      method: "GET",
      params: { agrementId },
    })();
    return history;
  },
  postMessage: async (agrementId: number, message: string) => {
    await buildRequest<AgrementAdminRoutes["PostMessage"]>({
      path: "/admin/agrements/{agrementId}/message",
      method: "POST",
      params: { agrementId: String(agrementId) },
      body: { message },
    })();
  },
};

export { AgrementService };
