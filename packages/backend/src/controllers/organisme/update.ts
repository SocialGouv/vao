import { type NextFunction, type Response } from "express";

import MailUtils = require("../../utils/mail");
import UserFoService from "../../services/FoUser";
import { mailService } from "../../services/mail";
import Organisme from "../../services/Organisme";
import TerritoireService from "../../services/Territoire";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function update(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  log.i("IN", req.body);
  const { body, decoded } = req;
  const organismeId = req.params.organismeId;
  const userId = req.decoded?.id;
  const { type, parametre } = body;
  const userId = decoded.id;

  if (!type || !parametre || !organismeId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  let currentSiret,
    organismeWithTheSiret,
    isChangementSiret = false;
  if (parametre.siret) {
    try {
      const isComplet = await Organisme.getIsComplet(organismeId);
      currentSiret = await Organisme.getSiret(organismeId);
      isChangementSiret = parametre.siret && parametre.siret !== currentSiret;
      organismeWithTheSiret = await Organisme.getBySiret(
        isChangementSiret ? currentSiret : parametre.siret,
      );
      if (
        !isComplet &&
        organismeWithTheSiret &&
        organismeWithTheSiret.organismeId.toString() !== organismeId.toString()
      ) {
        log.w(
          "DONE with error : Le siret ne peux pas etre modifé car il existe déjà en base",
        );
        throw new AppError(
          "Le siret ne peux pas etre modifé car il existe déjà en base",
          {
            name: "Forbidden - siret update - organisme incomplete",
            statusCode: 403,
          },
        );
      }
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  }
  try {
    await Organisme.update(type, parametre, organismeId, userId);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
  try {
    if (isChangementSiret) {
      const territoire = await TerritoireService.readFicheIdByTerCode(
        organismeWithTheSiret.agrement.regionObtention,
      );
      const fiche = await TerritoireService.readOne(territoire.id);
      const userUpdating = await UserFoService.readOne(userId);
      await mailService.send(
        MailUtils.bo.organisme.sendDreetsChangeSiret({
          ancienSiret: currentSiret,
          mailDreets: fiche.service_mail,
          nouveauSiret: parametre.siret,
          organisme: organismeWithTheSiret,
          user: userUpdating,
        }),
      );
    }
  } catch (error) {
    // On n'interromp pas le retour, le mail n'étant pas critique
    log.w("MAIL SEND FAILED", error);
  }

  return res.status(200).json({
    message: "sauvegarde organisme OK",
    organismeId,
  });
}
