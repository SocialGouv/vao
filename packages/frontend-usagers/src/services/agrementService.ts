import type {
  AgrementDto,
  AgrementUsagersRoutes,
  AGREMENT_STATUT,
} from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  patchStatut: async (agrementId: number, statut: AGREMENT_STATUT) => {
    return await buildRequest<AgrementUsagersRoutes["PatchStatut"]>({
      path: "/agrements/{agrementId}/statut",
      method: "PATCH",
      params: { agrementId: String(agrementId) },
      body: { statut },
    })();
  },
  getListAgrements: async (
    query: AgrementUsagersRoutes["GetList"]["query"],
  ) => {
    const { agrements } = await buildRequest<AgrementUsagersRoutes["GetList"]>({
      path: "/agrements",
      method: "GET",
      query,
    })();
    return { agrements };
  },
  postAgrement: async (agrement: AgrementDto) => {
    const { id } = await buildRequest<AgrementUsagersRoutes["PostAgrement"]>({
      path: "/agrements/",
      method: "POST",
      body: agrement,
    })();
    return id;
  },
  getAllActivies: async () => {
    const activites = await buildRequest<
      AgrementUsagersRoutes["GetAllActivites"]
    >({
      path: "/agrements/activites",
      method: "GET",
    })();
    return activites;
  },
  getHistory: async (agrementId: number) => {
    const history = await buildRequest<AgrementUsagersRoutes["GetHistory"]>({
      path: "/agrements/{agrementId}/history/",
      method: "GET",
      params: { agrementId: String(agrementId) },
    })();
    return history;
  },
  get: async (agrementId: number) => {
    const agrement = await buildRequest<AgrementUsagersRoutes["GetOne"]>({
      path: "/agrements/{agrementId}",
      method: "GET",
      params: { agrementId: String(agrementId) },
    })();
    return agrement;
  },
};

export { AgrementService };
