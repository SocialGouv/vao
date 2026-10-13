import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import type { UniteHebergementDto } from "../../../dto/hebergement.dto";
import type { PostSiteResponse } from "./postSite";

export interface GetSiteRoute extends BasicRoute {
  method: "GET";
  path: "/hebergement/site/{siteId}";
  params: {
    siteId: string;
  };
  query: {
    organismeId: number;
  };
  response: RouteResponseBody<{
    site: PostSiteResponse | null;
    unitesHebergement: UniteHebergementDto[];
  }>;
}

export const GetSiteRouteSchema: RouteSchema<GetSiteRoute> = {
  params: yup.object({
    siteId: yup.string().required(),
  }),
  query: yup.object({
    organismeId: yup
      .number()
      .typeError("L'organisme doit être un nombre")
      .required("Champ obligatoire"),
  }),
};
