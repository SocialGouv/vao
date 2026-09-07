import type { HebergementDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody, RouteSchema } from "../..";

export interface GetListUsagerRoute extends BasicRoute {
  method: "GET";
  path: "/hebergement/";
  response: RouteResponseBody<{ hebergements: HebergementDto[] }>;
}

export const GetListUsagerRouteSchema: RouteSchema<GetListUsagerRoute> = {};
