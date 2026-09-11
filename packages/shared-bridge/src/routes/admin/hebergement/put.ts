import * as yup from "yup";

import type { HebergementDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody, RouteSchema } from "../..";

export interface PutAdminRoute extends BasicRoute {
  method: "PUT";
  path: "/admin/hebergement/{id}";
  params: {
    id: string;
  };
  body: HebergementDto;
  response: RouteResponseBody<{ hebergement: HebergementDto | null }>;
}

export const PutAdminRouteSchema: RouteSchema<PutAdminRoute> = {
  body: yup.object({
    coordonnees: yup.object({
      adresse: yup.object().nullable().default(null),
      email: yup.string().email().nullable(),
      nomGestionnaire: yup.string().nullable(),
      numTelephone1: yup.string().nullable(),
      numTelephone2: yup.string().nullable(),
    }),
    id: yup.number().required(),
    informationsLocaux: yup.object().nullable(),
    informationsTransport: yup.object().nullable(),
    nom: yup.string().required(),
    organismeId: yup.number().required(),
    siteId: yup.string().nullable().default(null),
    statut: yup.string().nullable(),
  }) as yup.ObjectSchema<HebergementDto>,
  params: yup.object({
    id: yup.string().required(),
  }),
};
