import { type GetListAdminRoute, GetListAdminRouteSchema } from "./get-list";

export type OrganismeAdminRoutes = {
  GetList: GetListAdminRoute;
};

export const OrganismeAdminRoutesSchema = {
  GetList: GetListAdminRouteSchema,
};
