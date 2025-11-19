import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { DocumentDto } from "../../../dto";

export interface GetOneRoute extends BasicRoute {
  method: "GET";
  path: "/documents/{uuid}";
  params: {
    uuid: string;
  };
  response: RouteResponseBody<{ document: DocumentDto | null }>;
}

export const GetOneRouteSchema: RouteSchema<GetOneRoute> = {
  params: yup.object({
    uuid: yup.string().required(),
  }),
};
