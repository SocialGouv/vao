import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AdresseDto, SiteDto } from "../../../dto";

export type SiteSimilariteType =
  | "numeroVoie"
  | "typeVoie"
  | "adresseComplete"
  | "nomLieu";

export interface SiteSimilariteResult extends SiteDto {
  similarite: SiteSimilariteType;
}

export interface CheckSiteSimilaritesBody {
  adresse: AdresseDto | null;
  nomSiteOfficiel: string | null;
}

export interface CheckSiteSimilaritesRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/site/similarites";
  body: CheckSiteSimilaritesBody;
  response: RouteResponseBody<{ similarites: SiteSimilariteResult[] }>;
}

const adresseSchema = yup.object({
  cleInsee: yup.string().nullable(),
  codeInsee: yup.string().nullable(),
  codePostal: yup.string().nullable(),
  coordinates: yup.array(yup.number().nullable()),
  departement: yup.string().nullable(),
  id: yup.number().nullable(),
  label: yup.string().nullable(),
});

export const CheckSiteSimilaritesRouteSchema: RouteSchema<CheckSiteSimilaritesRoute> =
  {
    body: yup.object({
      adresse: adresseSchema.required(),
      nomSiteOfficiel: yup.string().nullable(),
    }) as yup.ObjectSchema<CheckSiteSimilaritesBody>,
  };
