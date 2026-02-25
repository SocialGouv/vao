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
  getByOrganismeId: async (organismeId: number) => {
    const { agrement } = await buildRequest<AgrementUsagersRoutes["GetOne"]>({
      path: "/agrements/organisme/{organismeId}",
      method: "GET",
      params: { organismeId: String(organismeId) },
    })();
    return agrement;
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
  getHistory: async (agrementId: string) => {
    const history = await buildRequest<AgrementUsagersRoutes["GetHistory"]>({
      path: "/agrements/history/{agrementId}",
      method: "GET",
      params: { agrementId },
    })();
    return history;
  },
};

export { AgrementService };
