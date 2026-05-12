import { NextFunction, Request, Response } from "express";

import { schema } from "../helpers/schema";
import commonCheckJWT from "./common/checkJWT";

export default function checkJWTWithoutCGU(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return commonCheckJWT(req, res, next, schema.FRONT, false);
}
