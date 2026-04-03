import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { AGREMENT_STATUT } from "../../../constantes/agrement";
import type { AgrementFilesDto } from "../../../dto/agrement.dto";

export interface PatchStatutRoute extends BasicRoute {
  method: "PATCH";
  path: "admin/agrements/{agrementId}/statut";
  params: {
    agrementId: string;
  };
  body: {
    statut: AGREMENT_STATUT;
    commentaire?: string;
    file?: AgrementFilesDto;
  };
  response: RouteResponseBody<{ success: boolean }>;
}

const STATUTS_WITH_REQUIRED_FIELDS = [AGREMENT_STATUT.A_MODIFIER];

const STATUTS_WITH_REQUIRED_FILE = [
  AGREMENT_STATUT.COMPLETUDE_CONFIRME,
  AGREMENT_STATUT.REFUSE,
];

const requiredCommentaireStatut = (field: yup.AnySchema) =>
  field.when("statut", {
    is: (val: AGREMENT_STATUT) => STATUTS_WITH_REQUIRED_FIELDS.includes(val),
    otherwise: (schema) => schema.notRequired().nullable(),
    then: (schema) => schema.required("Champ obligatoire"),
  });

const requiredFileStatut = (field: yup.AnySchema) =>
  field.when("statut", {
    is: (val: AGREMENT_STATUT) => STATUTS_WITH_REQUIRED_FILE.includes(val),
    otherwise: (schema) => schema.notRequired().nullable(),
    then: (schema) => schema.required("Champ obligatoire"),
  });

export const PatchStatutRouteSchema: RouteSchema<PatchStatutRoute> = {
  body: yup.object({
    commentaire: requiredCommentaireStatut(yup.string().min(20)),
    file: requiredFileStatut(yup.mixed()),
    statut: yup
      .mixed<AGREMENT_STATUT>()
      .oneOf(Object.values(AGREMENT_STATUT))
      .required(),
  }),
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
