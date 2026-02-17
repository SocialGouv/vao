import * as yup from "yup";

import type { BasicRoute, OrganismeDto, RouteResponseBody } from "../../..";
import { AGREMENT_STATUT } from "../../..";
import type { AgrementDto } from "../../../dto/agrement.dto";

export interface GetListRoute extends BasicRoute {
  path: "/admin/agrements/list";
  method: "GET";
  query: {
    name?: string;
    numeroAgrement?: string;
    siret?: string;
    statut?: string;
  };
  response: RouteResponseBody<{
    agrements: (AgrementDto & { organisme: OrganismeDto })[];
  }>;
}

export const GetListRouteSchema = {
  query: yup.object({
    name: yup.string().optional(),
    numeroAgrement: yup.string().optional(),
    siret: yup.string().optional(),
    statut: yup.string().oneOf(Object.values(AGREMENT_STATUT)).optional(),
  }),
};
