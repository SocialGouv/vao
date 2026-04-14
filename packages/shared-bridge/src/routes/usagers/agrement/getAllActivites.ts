import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { ActiviteDto } from "../../../dto/agrement.dto";

export interface GetAllActivitesRoute extends BasicRoute {
  path: "/agrements/activites";
  method: "GET";
  response: RouteResponseBody<ActiviteDto[]>;
}

export const GetAllActivitesRouteSchema: RouteSchema<GetAllActivitesRoute> = {};
