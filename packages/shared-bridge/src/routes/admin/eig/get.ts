import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

const stringOrStringArray = yup.lazy((value) =>
  Array.isArray(value)
    ? yup.array().of(yup.string().required())
    : yup.string().nullable(),
);

export interface GetAdminRoute extends BasicRoute {
  method: "GET";
  path: "/eig/admin";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    search?: {
      libelle?: string | null;
      statut?: string | string[] | null;
      idFonctionnelle?: string | null;
      type?: string | string[] | null;
      organisme?: string | null;
      departement?: string | string[] | null;
      dateRange?: Date | null;
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
    sortBy: yup.string().optional(),
    sortDirection: yup
      .mixed<"asc" | "desc">()
      .oneOf(["asc", "desc"])
      .optional(),
    search: yup
      .object({
        libelle: yup.string().nullable().optional(),
        statut: stringOrStringArray.optional(),
        idFonctionnelle: yup.string().nullable().optional(),
        type: stringOrStringArray.optional(),
        organisme: yup.string().nullable().optional(),
        departement: stringOrStringArray.optional(),
        dateRange: yup.date().nullable().optional(),
      })
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          return JSON.parse(originalValue);
        }
        return value;
      })
      .optional(),
  }),
};
