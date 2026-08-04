import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

const stringOrStringArray = yup.lazy((value) =>
  Array.isArray(value)
    ? yup.array().of(yup.string().required())
    : yup.string().nullable(),
);

export const EIG_ADMIN_SORT_COLUMNS = [
  "organisme",
  "idFonctionnelle",
  "departement",
  "libelle",
  "dateDebut",
  "date",
  "dateDepot",
  "statut",
] as const;

export type EigAdminSortColumn = (typeof EIG_ADMIN_SORT_COLUMNS)[number];

export interface GetAdminRoute extends BasicRoute {
  method: "GET";
  path: "/eig/admin";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: EigAdminSortColumn;
    sortDirection?: "ASC" | "DESC";
    search?: {
      libelle?: string | null;
      statut?: string | string[] | null;
      idFonctionnelle?: string | null;
      type?: string | string[] | null;
      organisme?: string | null;
      departement?: string | string[] | null;
      startAt?: Date | null;
      endAt?: Date | null;
    };
  };
  response: RouteResponseBody<{
    eig: unknown[];
    total: number;
  }>;
}

export const GetAdminRouteSchema: RouteSchema<GetAdminRoute> = {
  query: yup.object({
    limit: yup.number().optional(),
    offset: yup.number().optional(),
    search: yup
      .object({
        departement: stringOrStringArray.optional(),
        endAt: yup.date().nullable().optional(),
        idFonctionnelle: yup.string().nullable().optional(),
        libelle: yup.string().nullable().optional(),
        organisme: yup.string().nullable().optional(),
        startAt: yup.date().nullable().optional(),
        statut: stringOrStringArray.optional(),
        type: stringOrStringArray.optional(),
      })
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          return JSON.parse(originalValue);
        }
        return value;
      })
      .optional(),
    sortBy: yup
      .string()
      .oneOf([...EIG_ADMIN_SORT_COLUMNS])
      .optional(),
    sortDirection: yup.string().oneOf(["ASC", "DESC"]).optional(),
  }),
};
