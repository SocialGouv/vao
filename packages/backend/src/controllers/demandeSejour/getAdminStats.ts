import type { NextFunction, Response } from "express";

import { getAdminStats } from "../../services/DemandeSejour";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";

export default async function get(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req?.departements) {
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  const departementCodes = (req.departements ?? []).map(
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
}
