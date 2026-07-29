import type { BasicRoute, RouteSchema } from "../../..";

export interface GetExtractRoute extends BasicRoute {
  path: "/admin/agrements/extract";
  method: "GET";
  response: void;
}

export const GetExtractRouteSchema: RouteSchema<GetExtractRoute> = {};
