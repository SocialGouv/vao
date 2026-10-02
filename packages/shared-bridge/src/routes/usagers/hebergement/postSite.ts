import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { AdresseDto, SiteDto } from "../../../dto";

export type PostSiteBody = Omit<
  SiteDto,
  | "id"
  | "siteId"
  | "current"
  | "adresseId"
  | "adresse"
  | "createdAt"
  | "editedAt"
  | "createdBy"
  | "editedBy"
> & { adresse: AdresseDto };

export interface PostSiteRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/site";
  body: PostSiteBody;
  response: RouteResponseBody<{ siteId: string }>;
}

const adresseSchema = yup.object({
  cleInsee: yup.string().nullable().default(null),
  codeInsee: yup.string().nullable().default(null),
  codePostal: yup.string().nullable().default(null),
  coordinates: yup.array(yup.number().nullable()).default([]),
  departement: yup.string().nullable().default(null),
  id: yup.number().nullable().default(null),
  label: yup.string().required("Champ obligatoire"),
});

export const PostSiteRouteSchema: RouteSchema<PostSiteRoute> = {
  body: yup.object({
    adresse: adresseSchema.required("Champ obligatoire"),
    deplacementProximiteDescription: yup.string().nullable(),
    descriptif: yup.string().nullable(),
    excursionDescription: yup.string().nullable(),
    hebergementTypeId: yup
      .number()
      .typeError("Le type d'hébergement doit être un nombre")
      .nullable(),
    nomSite: yup.string().required("Champ obligatoire"),
    nomSiteOfficiel: yup.string().required("Champ obligatoire"),
    organismeId: yup
      .number()
      .typeError("L'organisme doit être un nombre")
      .required("Champ obligatoire"),
    respEmail: yup.string().nullable(),
    respNomPrenom: yup.string().nullable(),
    respTelephone: yup.string().nullable(),
    vehiculesAdaptes: yup.boolean().nullable(),
  }) as yup.ObjectSchema<PostSiteBody>,
};
