import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { TerritoireDto } from "../../../dto";

export interface GetByAgrementRegionUserRoute extends BasicRoute {
  method: "GET";
  path: "/territoire/get-by-agrement-region-user/";
  response: RouteResponseBody<{ territoire: TerritoireDto | null }>;
}

export const GetByAgrementRegionUserRouteSchema: RouteSchema<GetByAgrementRegionUserRoute> =
  {
    // No params
  };
