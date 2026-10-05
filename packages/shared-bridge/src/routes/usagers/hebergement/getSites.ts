import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { SiteListeDto } from "../../../dto";

export const SITES_USAGERS_SORT_COLUMNS = [
  "nom",
  "adresse",
  "departement",
  "statut",
] as const;

export type SitesUsagersSortColumn =
  (typeof SITES_USAGERS_SORT_COLUMNS)[number];

export interface GetSitesRoute extends BasicRoute {
  method: "GET";
  path: "/hebergement/sites";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: SitesUsagersSortColumn;
    sortDirection?: "ASC" | "DESC";
    statut?: string;
    nom?: string;
    adresse?: string;
  };
  response: RouteResponseBody<{
    rows: SiteListeDto[];
    total: number;
  }>;
}

export const GetSitesRouteSchema: RouteSchema<GetSitesRoute> = {
  query: yup.object({
    adresse: yup.string().optional(),
    limit: yup.number().optional(),
    nom: yup.string().optional(),
    offset: yup.number().optional(),
    sortBy: yup
      .string()
      .oneOf([...SITES_USAGERS_SORT_COLUMNS])
      .optional(),
    sortDirection: yup.string().oneOf(["ASC", "DESC"]).optional(),
    statut: yup.string().optional(),
  }),
};
