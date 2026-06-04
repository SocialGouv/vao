import { Response } from "express";

import { schema } from "../../helpers/schema";
import { UserRequest } from "../../types/request";
import commonDisconnect from "../common/authentication/disconnect";

export async function disconnect(req: UserRequest, res: Response) {
  return commonDisconnect(req, res, schema.FRONT);
}
