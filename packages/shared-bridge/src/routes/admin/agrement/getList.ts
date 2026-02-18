import * as yup from "yup";

import type {
  BasicRoute,
  OrganismeDto,
  RouteResponseBody,
  RouteSchema,
} from "../../..";
import { AGREMENT_STATUT } from "../../..";
import type { AgrementDto } from "../../../dto/agrement.dto";
import type { PaginationQueryDto } from "../../../dto/paginationQueryDto";
import { SearchQuerySchema } from "../../schemas";

export interface GetListRoute extends BasicRoute {
  path: "/admin/agrements/list";
  method: "GET";
  query: PaginationQueryDto & {
    name?: string;
    numero?: string;
    siret?: string;
    statut?: string;
  };
  response: RouteResponseBody<{
    count: number;
    agrements: Array<AgrementDto & { organisme: OrganismeDto }>;
  }>;
}

export const GetListRouteSchema: RouteSchema<GetListRoute> = {
  query: yup.object({
    ...SearchQuerySchema,
    name: yup.string().optional(),
    numero: yup.string().optional(),
    siret: yup.string().optional(),
    statut: yup.string().oneOf(Object.values(AGREMENT_STATUT)).optional(),
  }),
};
