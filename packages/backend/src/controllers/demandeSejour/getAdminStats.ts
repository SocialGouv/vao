import type { NextFunction, Response } from "express";

import { UserRequestWithDep } from "../../types/request";
import AppError from "../../utils/error";

const { getAdminStats } = require("../../services/DemandeSejour");

module.exports = async function get(
  req: UserRequestWithDep,
  res: Response,
  next: NextFunction,
) {
  if (!(req as any)?.departements) {
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  const departementCodes = ((req as any).departements ?? []).map(
    (d: { value: string; label: string }) => d.value,
  );
  const territoireCode = req.decoded?.territoireCode;
  if (!territoireCode) {
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const { stats } = await getAdminStats({
      departementCodes,
      territoireCode,
    });
    return res.status(200).json({ stats });
  } catch (error) {
    return next(error);
  }
};
