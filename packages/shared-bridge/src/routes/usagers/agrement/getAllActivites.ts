import type { BasicRoute } from "@vao/shared-bridge";
import { ActiviteDto } from "@vao/shared-bridge";
import * as yup from "yup";

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
