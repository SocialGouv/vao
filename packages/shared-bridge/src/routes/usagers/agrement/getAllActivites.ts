import * as yup from "yup";

import type { BasicRoute } from "../../..";
import type { ActiviteDto } from "../../../dto/agrement.dto";

export interface GetAllActivitesRoute extends BasicRoute {
  path: "/agrements/activites";
  method: "GET";
  response: ActiviteDto[];
}

export const GetAllActivitesRouteSchema = {
  response: yup.array(
    yup.object({
      activiteType: yup.string().oneOf(["SPORT", "CULTURE"]).required(),
      code: yup.string().required(),
      id: yup.number().required(),
      libelle: yup.string().required(),
    }),
  ),
};
