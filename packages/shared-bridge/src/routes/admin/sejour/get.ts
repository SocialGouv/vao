import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

const stringOrStringArray = yup.lazy((value) =>
  Array.isArray(value)
    ? yup.array().of(yup.string().required())
    : yup.string().nullable(),
);

export const SEJOUR_ADMIN_SORT_COLUMNS = [
  "organisme",
  "idFonctionnelle",
  "departement",
  "libelle",
  "dateDebut",
  "date",
  "dateDepot",
  "statut",
  "messageOrdreEtat",
] as const;

export type SejourAdminSortColumn = (typeof SEJOUR_ADMIN_SORT_COLUMNS)[number];

export interface GetAdminRoute extends BasicRoute {
  method: "GET";
  path: "/sejour/admin";
  query?: {
    limit?: number;
    offset?: number;
    sortBy?: SejourAdminSortColumn;
    sortDirection?: "ASC" | "DESC";
    search?: {
      typeOrganisme?: string | null;
      personneMorale?: string | null;
      personnePhysique?: string | null;
      idFonctionnelle?: string | null;
      demandeSejourId?: number | null;
      declarationId?: number | null;
      organismeId?: number | null;
      organisme?: string | null;
      libelle?: string | null;
      statuts?: string | string[] | null;
      messageOrdreEtat?: number | null;
      departement?: string | string[] | null;
      dateDebut?: Date | null;
      dateFin?: Date | null;
      dateDepot?: Date | null;
      siren?: string | null;
      siret?: string | null;
    };
  };
  response: RouteResponseBody<{
    demandesWithPagination: { demande_sejour: unknown[]; total: number };
  }>;
}

export const GetAdminRouteSchema: RouteSchema<GetAdminRoute> = {
  query: yup.object({
    limit: yup.number().optional(),
    offset: yup.number().optional(),
    search: yup
      .object({
        dateDebut: yup.date().nullable().optional(),
        dateDepot: yup.date().nullable().optional(),
        dateFin: yup.date().nullable().optional(),
        declarationId: yup.number().nullable().optional(),
        demandeSejourId: yup.number().nullable().optional(),
        departement: stringOrStringArray.optional(),
        idFonctionnelle: yup.string().nullable().optional(),
        libelle: yup.string().nullable().optional(),
        messageOrdreEtat: yup.number().nullable().optional(),
        organisme: yup.string().nullable().optional(),
        organismeId: yup.number().nullable().optional(),
        personneMorale: yup.string().nullable().optional(),
        personnePhysique: yup.string().nullable().optional(),
        siren: yup.string().nullable().optional(),
        siret: yup.string().nullable().optional(),
        statuts: stringOrStringArray.optional(),
        typeOrganisme: yup.string().nullable().optional(),
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
      .oneOf([...SEJOUR_ADMIN_SORT_COLUMNS])
      .optional(),
    sortDirection: yup.string().oneOf(["ASC", "DESC"]).optional(),
  }),
};
