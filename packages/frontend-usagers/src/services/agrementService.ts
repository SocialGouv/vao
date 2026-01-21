import type { AgrementDto, AgrementUsagersRoutes } from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  getByOrganismeId: async (organismeId: number) => {
    const { agrement } = await buildRequest<AgrementUsagersRoutes["GetOne"]>({
      path: "/agrements/organisme/{id}",
      method: "GET",
      params: { id: String(organismeId) },
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
};

export { AgrementService };
