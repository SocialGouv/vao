import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

export const ORGANISME_SORT_COLUMNS = [
  "name",
  "typeOrganisme",
  "editedAt",
  "complet",
  "siret",
  "agrement:regionObtention",
  "agrement:dateObtention",
  "sejourCount",
] as const;

export type OrganismeSortColumn = (typeof ORGANISME_SORT_COLUMNS)[number];

export interface GetListAdminRoute extends BasicRoute {
  method: "GET";
  path: "/organisme/bo/liste";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: OrganismeSortColumn;
    sortDirection?: "ASC" | "DESC";
    name?: string;
    siret?: string;
    "agrement:regionObtention"?: string;
    "agrement:dateObtention"?: string;
  };
  response: RouteResponseBody<{
    rows: unknown[];
    total: number;
  }>;
}

export const GetListAdminRouteSchema: RouteSchema<GetListAdminRoute> = {
  query: yup.object({
    "agrement:dateObtention": yup.string().optional(),
    "agrement:regionObtention": yup.string().optional(),
    limit: yup.number().optional(),
    name: yup.string().optional(),
    offset: yup.number().optional(),
    siret: yup.string().optional(),
    sortBy: yup
      .string()
      .oneOf([...ORGANISME_SORT_COLUMNS])
      .optional(),
    sortDirection: yup.string().oneOf(["ASC", "DESC"]).optional(),
  }),
};
