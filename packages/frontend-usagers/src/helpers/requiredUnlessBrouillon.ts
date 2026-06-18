import type { AnySchema } from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";

export const requiredUnlessBrouillon = (schema: AnySchema) =>
  schema.when("statut", {
    is: (val: AGREMENT_STATUT) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema: AnySchema) => schema.required("Champ obligatoire"),
    otherwise: (schema: AnySchema) => schema.nullable(),
  });
