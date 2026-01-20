import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";

export const requiredUnlessBrouillon = (schema: yup.AnySchema) =>
  schema.when("statut", {
    is: (val: AGREMENT_STATUT) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema: any) => schema.required("Champ obligatoire"),
    otherwise: (schema: any) => schema.nullable(),
  });
