import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type {
  UniteHebergementDto,
  UniteHebergementPayloadDto,
} from "../../../dto";

export type PostUniteHebergementBody = UniteHebergementPayloadDto & {
  organismeId: number;
  typePensions?: string[];
};

export type PostUniteHebergementResponse = UniteHebergementDto;

export interface PostUniteHebergementRoute extends BasicRoute {
  method: "POST";
  path: "/hebergement/site/{siteId}/unites";
  params: { siteId: string };
  body: PostUniteHebergementBody;
  response: RouteResponseBody<PostUniteHebergementResponse>;
}

export const PostUniteHebergementRouteSchema: RouteSchema<PostUniteHebergementRoute> =
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
      organismeId: yup
        .number()
        .typeError("L'organisme doit être un nombre")
        .required("Champ obligatoire"),
      rangementIndividuel: yup.boolean().nullable(),
      reglementationErp: yup.boolean().nullable(),
      separationHommeFemme: yup.boolean().nullable(),
      prestationsHotelieres: yup.array().of(yup.string().defined()).optional(),
      typePensions: yup.array().of(yup.string().defined()).optional(),
      visiteLocaux: yup.boolean().nullable(),
      visiteLocauxAt: yup
        .mixed<string | Date>()
        .transform((_, raw) =>
          typeof raw === "string" && raw.trim() !== "" ? new Date(raw) : raw,
        )
        .nullable(),
    }) as yup.ObjectSchema<PostUniteHebergementBody>,
    params: yup.object({
      siteId: yup.string().required("Champ obligatoire"),
    }),
  };
