import type {
  AgrementAdminRoutes,
  AGREMENT_STATUT,
  AgrementFilesDto,
} from "@vao/shared-bridge";
import { buildRequest } from "~/utils/fetchBackend";

const AgrementService = {
  patchStatut: async (
    agrementId: number,
    statut: AGREMENT_STATUT,
    commentaire?: string,
    file?: AgrementFilesDto,
  ) => {
    return await buildRequest<AgrementAdminRoutes["PatchStatut"]>({
      path: "admin/agrements/{agrementId}/statut",
      method: "PATCH",
      params: { agrementId: String(agrementId) },
      body: { statut, commentaire, file },
    })();
  },
  markMessagesAsRead: async (agrementId: string) => {
    const { count } = await buildRequest<AgrementAdminRoutes["PatchMessages"]>({
      path: "/admin/agrements/{agrementId}/messages/read",
      method: "PATCH",
      params: { agrementId },
    })();
    return count;
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
  postMessage: async (agrementId: string, message: string) => {
    await buildRequest<AgrementAdminRoutes["PostMessage"]>({
      path: "/admin/agrements/{agrementId}/message",
      method: "POST",
      params: { agrementId: String(agrementId) },
      body: { message },
    })();
  },
  getMessages: async (agrementId: string) => {
    const messages = await buildRequest<AgrementAdminRoutes["GetMessages"]>({
      path: "/admin/agrements/{agrementId}/messages",
      method: "GET",
      params: { agrementId },
    })();
    return messages;
  },
};

export { AgrementService };
