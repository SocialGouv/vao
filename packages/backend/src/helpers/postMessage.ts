import { NextFunction, Response } from "express";

import MessageSchema from "../schemas/message";
import DeclarationSejourService from "../services/DemandeSejour";
import { mailService } from "../services/mail";
import Message from "../services/Message";
import { UserRequest } from "../types/request";
import AppError from "../utils/error";
import { logger } from "../utils/logger";
import ValidationAppError from "../utils/validation-error";

const log = logger(module.filename);

export default async function postMessage({
  req,
  res,
  next,
  source,
  getDestinataires,
  getMailPayload,
}: {
  req: UserRequest;
  res: Response;
  next: NextFunction;
  source: "front" | "back";
  // eslint-disable-next-line no-unused-vars
  getDestinataires: (params: any) => string[];
  // eslint-disable-next-line no-unused-vars
  getMailPayload: (params: any) => any;
}) {
  log.i("IN");
  const { body, decoded } = req;
  const { declarationId } = req.params;
  const userId = decoded?.id;

  let messageData;

  try {
    messageData = await MessageSchema.schema().validate(
      {
        declaration_id: declarationId,
        file: body.file,
        message: body.message,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );
  } catch (error: any) {
    return next(new ValidationAppError(error));
  }

  const { message, file } = messageData;

  const declaration = await DeclarationSejourService.getOne({
    "ds.id": declarationId,
  });
  if (!declaration) {
    log.w(`cannot get declaration ${declarationId} `);
    return next(
      new AppError("declaration inaccessible", {
        statusCode: 400,
      }),
    );
  }

  let id;
  try {
    id = await Message.post(declarationId, userId, message, file, source);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
  try {
    const destinataires = await getDestinataires(declaration);

    if (destinataires && destinataires.length > 0) {
      await mailService.send(
        getMailPayload({ declaration, destinataires, message }),
      );
    }
  } catch (error) {
    log.w("erreur sur l'envoi de mail :", error);
    return next(error);
  }
  return res.status(200).json({
    id,
    message: "message envoyé",
  });
}
