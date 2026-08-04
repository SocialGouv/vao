import type { AnySchema } from "yup";
import type { AGREMENT_STATUT } from "@vao/shared-bridge";
import { AGREMENT_STATUTS_PERMISSIFS } from "@vao/shared-bridge";

export const requiredUnlessBrouillon = (schema: AnySchema) =>
  schema.when("statut", {
    is: (val: AGREMENT_STATUT) => !AGREMENT_STATUTS_PERMISSIFS.has(val),
    then: (schema: AnySchema) => schema.required("Champ obligatoire"),
    otherwise: (schema: AnySchema) => schema.nullable(),
  });
