import * as yup from "yup";

import type { SiretSuccesseurDto } from "../../../dto";
import type { BasicRoute, RouteResponseBody, RouteSchema } from "../..";

export interface GetSuccesseurRoute extends BasicRoute {
  method: "GET";
  path: "/siret/get-lien-succession/:siret";
  params: {
    siret: string;
  };
  response: RouteResponseBody<{
    siretEtablissementSuccesseur: SiretSuccesseurDto | null;
  }>;
}

export const GetSuccesseurRouteSchema: RouteSchema<GetSuccesseurRoute> = {
  params: yup.object({
    siret: yup.string().required(),
  }),
};
