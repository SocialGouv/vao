import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

const stringOrStringArray = yup.lazy((value) =>
  Array.isArray(value)
    ? yup.array().of(yup.string().required()).strict()
    : yup.string().nullable().strict(),
);

export const EIG_USAGERS_SORT_COLUMNS = [
  "libelle",
  "statut",
  "id",
  "dateDebut",
  "dateFin",
  "idFonctionnelle",
  "createdAt",
] as const;

export type EigUsagersSortColumn = (typeof EIG_USAGERS_SORT_COLUMNS)[number];

export interface GetUsagersRoute extends BasicRoute {
  method: "GET";
  path: "/eig/me";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: EigUsagersSortColumn;
    sortDirection?: "ASC" | "DESC";
    search?: {
      libelle?: string | null;
      statut?: string | string[] | null;
      idFonctionnelle?: string | null;
      id?: string | null;
      createdAt?: Date | null;
      type?: string | string[] | null;
    };
  };
  response: RouteResponseBody<{
    eig: unknown;
  }>;
}

export const GetUsagersRouteSchema: RouteSchema<GetUsagersRoute> = {
  query: yup.object({
    limit: yup.number().optional(),
    offset: yup.number().optional(),
    search: yup
      .object({
        createdAt: yup.date().nullable().optional(),
        id: yup.string().nullable().optional(),
        idFonctionnelle: yup.string().nullable().optional(),
        libelle: yup.string().nullable().optional(),
        statut: stringOrStringArray.optional(),
        type: stringOrStringArray.optional(),
      })
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          try {
            return JSON.parse(originalValue);
          } catch {
            return undefined;
          }
        }
        return value;
      })
      .optional(),
    sortBy: yup
      .string()
      .oneOf([...EIG_USAGERS_SORT_COLUMNS])
      .optional(),
    sortDirection: yup.string().oneOf(["ASC", "DESC"]).optional(),
  }),
};
