import { createReadStream } from "node:fs";

import axios from "axios";
import { NextFunction, Request, Response } from "express";
import FormData from "form-data";

import { config } from "../config";
import AppError from "../utils/error";
import { logger } from "../utils/logger";

const log = logger(module.filename);

async function scanFile(req: Request, _res: Response, next: NextFunction) {
  if (!req.file) {
    return next(
      new AppError("Fichier manquant", {
        statusCode: 400,
      }),
    );
  }

  const { path, originalname } = req.file;
  try {
    log.i("IN", { originalname, path });
    const form = new FormData();

    form.append("FILES", createReadStream(path));

    const formHeaders = form.getHeaders();

    const { data } = await axios.post<{
      success: boolean;
      data?: {
        result: { viruses: string[] }[];
      };
    }>(config.antivirusUrl!, form, {
      headers: { ...formHeaders },
    });

    log.d(JSON.stringify(data));

    if (!data.success) {
      log.w("DONE - Service unavailable");
      return next(
        new AppError("Le service antivirus n'est pas disponible", {
          name: "file.scan-antivirus-unavailable",
          statusCode: 503,
        }),
      );
    }

    if (data.data?.result[0]?.viruses.length) {
      log.w(
        "DONE - Scan returns threat on file " + originalname,
        ...data.data.result[0].viruses,
      );
      return next(
        new AppError("Scan returns threat on file " + originalname, {
          name: "file.scan-antivirus",
        }),
      );
    }

    log.i("DONE");
    return next();
  } catch (error) {
    log.w("DONE - Service unavailable", error);
    return next(
      new AppError("Le service antivirus n'est pas disponible", {
        cause: error,
        name: "file.scan-antivirus-unavailable",
        statusCode: 503,
      }),
    );
  }
}

export default scanFile;
