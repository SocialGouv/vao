import { NextFunction, Request, Response } from "express";

import { schema } from "../helpers/schema";
import commonCheckJWT from "./common/checkJWT";

function checkJWTWithoutCGU(req: Request, res: Response, next: NextFunction) {
  return commonCheckJWT(req, res, next, schema.FRONT, false);
}

module.exports = checkJWTWithoutCGU;
