import * as yup from "yup";

import type { OrganismeDto, RouteResponseBody } from "../../..";
import { AGREMENT_STATUT } from "../../..";
import type { AgrementDto } from "../../../dto/agrement.dto";

export interface GetListRoute {
  path: "/admin/agrements/list";
  method: "GET";
  query: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: string;
    search?: {
      name?: string;
      numero?: string;
      siret?: string;
      statut?: string;
    };
  };
  response: RouteResponseBody<{
    count: number;
    agrements: (AgrementDto & { organisme: OrganismeDto })[];
  }>;
}

export const GetListRouteSchema = {
  query: yup.object({
    limit: yup.number().optional(),
    offset: yup.number().optional(),
    search: yup
      .object({
        name: yup.string().optional(),
        numero: yup.string().optional(),
        siret: yup.string().optional(),
        statut: yup.string().oneOf(Object.values(AGREMENT_STATUT)).optional(),
      })
      .optional(),
    sortBy: yup.string().optional(),
    sortDirection: yup.string().optional(),
  }),
};
