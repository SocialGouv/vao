import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { HEBERGEMENT_STATUT } from "../../../constantes/hebergement";

export interface ResponsableDto {
  email: string | null;
  nomPrenom: string | null;
  telephone: string | null;
}

export interface PatchSiteBody {
  description: string | null;
  hebergementTypeValue: string | null;
  organismeId: number;
  responsable: ResponsableDto;
  statut?: HEBERGEMENT_STATUT;
}

export interface PatchSiteRoute extends BasicRoute {
  method: "PATCH";
  path: "/hebergement/site/{siteId}";
  params: { siteId: string };
  body: PatchSiteBody;
  response: RouteResponseBody<Record<string, never>>;
}

const requiredUnlessBrouillon = (field: yup.AnySchema) =>
  field.when("statut", {
    is: (val?: string) => val !== HEBERGEMENT_STATUT.BROUILLON,
    otherwise: (schema) => schema.nullable(),
    then: (schema) => schema.required("Champ obligatoire"),
  });

export const PatchSiteRouteSchema: RouteSchema<PatchSiteRoute> = {
  body: yup.object({
    description: requiredUnlessBrouillon(
      yup
        .string()
        .nullable()
        .max(500, "La description ne peut pas dépasser 500 caractères"),
    ),
    hebergementTypeValue: requiredUnlessBrouillon(yup.string().nullable()),
    organismeId: yup
      .number()
      .typeError("L'organisme doit être un nombre")
      .required("Champ obligatoire"),
    responsable: yup.object({
      email: requiredUnlessBrouillon(yup.string().nullable()),
      nomPrenom: requiredUnlessBrouillon(yup.string().nullable()),
      telephone: requiredUnlessBrouillon(yup.string().nullable()),
    }),
    statut: yup
      .mixed<HEBERGEMENT_STATUT>()
      .oneOf(Object.values(HEBERGEMENT_STATUT))
      .default(HEBERGEMENT_STATUT.BROUILLON),
  }) as unknown as yup.ObjectSchema<PatchSiteBody>,
  params: yup.object({
    siteId: yup.string().required(),
  }),
};
