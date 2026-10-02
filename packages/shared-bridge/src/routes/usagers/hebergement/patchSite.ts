import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";

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
}

export interface PatchSiteRoute extends BasicRoute {
  method: "PATCH";
  path: "/hebergement/site/{siteId}";
  params: { siteId: string };
  body: PatchSiteBody;
  response: RouteResponseBody<Record<string, never>>;
}

export const PatchSiteRouteSchema: RouteSchema<PatchSiteRoute> = {
  body: yup.object({
    description: yup.string().nullable(),
    hebergementTypeValue: yup.string().nullable(),
    organismeId: yup
      .number()
      .typeError("L'organisme doit être un nombre")
      .required("Champ obligatoire"),
    responsable: yup.object({
      email: yup.string().nullable(),
      nomPrenom: yup.string().nullable(),
      telephone: yup.string().nullable(),
    }),
  }) as yup.ObjectSchema<PatchSiteBody>,
  params: yup.object({
    siteId: yup.string().required(),
  }),
};
