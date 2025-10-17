import type { NextFunction, Response } from "express";

// eslint-disable-next-line import/default
import DemandeSejourService from "../../services/DemandeSejour";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";

const { getAdminStatss } = DemandeSejourService;
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  log.i("IN");
  const departementCodes = req.departements.map((d) => d.value) ?? [];
  const territoireCode = req.decoded.territoireCode;
  if (!departementCodes) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const { stats } = await getAdminStatss({
      departementCodes,
      territoireCode,
    });
    return res.status(200).json({ stats });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
