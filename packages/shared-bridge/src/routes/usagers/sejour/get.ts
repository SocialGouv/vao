import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

const stringOrStringArray = yup.lazy((value) =>
  Array.isArray(value) ? yup.array().of(yup.string().required()) : yup.string(),
);

export const SEJOUR_USAGERS_SORT_COLUMNS = [
  "idFonctionnelle",
  "libelle",
  "departementSuivi",
  "siret",
  "dateDebut",
  "statut",
] as const;

export type SejourUsagersSortColumn =
  (typeof SEJOUR_USAGERS_SORT_COLUMNS)[number];

export interface GetUsagersRoute extends BasicRoute {
  method: "GET";
  path: "/sejour";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: SejourUsagersSortColumn;
    sortDirection?: "ASC" | "DESC";
    idFonctionnelle?: string;
    libelle?: string;
    departementSuivi?: string | string[];
    statut?: string | string[];
    periode?: string | string[];
  };
  response: RouteResponseBody<{
    demandes: unknown[];
    total: number;
  }>;
}

export const GetUsagersRouteSchema: RouteSchema<GetUsagersRoute> = {
  query: yup.object({
    departementSuivi: stringOrStringArray.optional(),
    idFonctionnelle: yup.string().optional(),
    libelle: yup.string().optional(),
    limit: yup.number().optional(),
    offset: yup.number().optional(),
    periode: stringOrStringArray.optional(),
    sortBy: yup
      .string()
      .oneOf([...SEJOUR_USAGERS_SORT_COLUMNS])
      .optional(),
    sortDirection: yup.string().oneOf(["ASC", "DESC"]).optional(),
    statut: stringOrStringArray.optional(),
  }),
};
