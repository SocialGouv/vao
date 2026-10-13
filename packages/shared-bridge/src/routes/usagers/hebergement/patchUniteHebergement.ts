import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type {
  UniteHebergementDto,
  UniteHebergementPayloadDto,
} from "../../../dto";

export type PatchUniteHebergementBody = UniteHebergementPayloadDto & {
  typePensions?: string[];
};

export type PatchUniteHebergementResponse = UniteHebergementDto;

export interface PatchUniteHebergementRoute extends BasicRoute {
  method: "PATCH";
  path: "/hebergement/site/{siteId}/unites/{uniteId}";
  params: { siteId: string; uniteId: string };
  query: { organismeId: number };
  body: PatchUniteHebergementBody;
  response: RouteResponseBody<PatchUniteHebergementResponse>;
}

export const PatchUniteHebergementRouteSchema: RouteSchema<PatchUniteHebergementRoute> =
  {
    body: yup.object({
      accessibilitePmr: yup.boolean().nullable(),
      accessibilitePrecision: yup.string().nullable(),
      amenagementsSpecifiques: yup.boolean().nullable(),
      amenagementsSpecifiquesPrecision: yup.string().nullable(),
      chambresDoubles: yup.boolean().nullable(),
      complementLocalisation: yup.string().nullable(),
      couchageIndividuel: yup.boolean().nullable(),
      fileDernierArreteAutorisationMaire: yup.string().nullable(),
      fileDerniereAttestationSecurite: yup.string().nullable(),
      fileReponseExploitantOuProprietaire: yup.string().nullable(),
      litsSuperposes: yup.boolean().nullable(),
      nombreChambreTotal: yup.number().nullable(),
      nombreCouchageTotal: yup.number().nullable(),
      prestationsHotelieres: yup.array().of(yup.string().defined()).optional(),
      rangementIndividuel: yup.boolean().nullable(),
      reglementationErp: yup.boolean().nullable(),
      separationHommeFemme: yup.boolean().nullable(),
      typePensions: yup.array().of(yup.string().defined()).optional(),
      visiteLocaux: yup.boolean().nullable(),
      visiteLocauxAt: yup
        .mixed<string | Date>()
        .transform((_, raw) =>
          typeof raw === "string" && raw.trim() !== "" ? new Date(raw) : raw,
        )
        .nullable(),
    }) as yup.ObjectSchema<PatchUniteHebergementBody>,
    params: yup.object({
      siteId: yup.string().required("Champ obligatoire"),
      uniteId: yup
        .string()
        .matches(/^\d+$/, "L'unité d'hébergement doit être un entier")
        .required("Champ obligatoire"),
    }),
    query: yup.object({
      organismeId: yup
        .number()
        .typeError("L'organisme doit être un nombre")
        .required("Champ obligatoire"),
    }),
  };
