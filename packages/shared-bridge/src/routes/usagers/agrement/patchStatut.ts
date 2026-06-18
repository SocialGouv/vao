import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { AGREMENT_STATUT } from "../../../constantes/agrement";

export interface PatchStatutRoute extends BasicRoute {
  method: "PATCH";
  path: "/agrements/{agrementId}/statut";
  params: {
    agrementId: string;
  };
  body: {
    statut: AGREMENT_STATUT;
  };
  response: RouteResponseBody<{ success: boolean }>;
}

export const PatchStatutRouteSchema: RouteSchema<PatchStatutRoute> = {
  body: yup.object({
    statut: yup
      .mixed<AGREMENT_STATUT>()
      .oneOf(Object.values(AGREMENT_STATUT))
      .required(),
  }),
  params: yup.object({
    agrementId: yup.string().required(),
  }),
};
