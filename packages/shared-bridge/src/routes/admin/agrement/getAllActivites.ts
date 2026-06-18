//import * as yup from "yup";

import type { BasicRoute, RouteResponseBody } from "../../..";
import type { ActiviteDto } from "../../../dto/agrement.dto";

export interface GetAllActivitesRoute extends BasicRoute {
  path: "/admin/agrements/activites";
  method: "GET";
  response: RouteResponseBody<ActiviteDto[] | []>;
}
