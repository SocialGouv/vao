import type { HebergementDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody, RouteSchema } from "../..";

export interface GetListAdminRoute extends BasicRoute {
  method: "GET";
  path: "/admin/hebergement/";
  response: RouteResponseBody<{ hebergements: HebergementDto[] }>;
}

export const GetListAdminRouteSchema: RouteSchema<GetListAdminRoute> = {};
