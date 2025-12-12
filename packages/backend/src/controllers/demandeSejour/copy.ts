import { DEMANDE_SEJOUR_STATUTS } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";
import { DatabaseError } from "pg";

import DemandeSejour from "../../services/DemandeSejour";
import Organisme from "../../services/Organisme";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function post(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const { declarationId } = req.params;
  const userId = req.decoded?.id;
  if (!userId) {
    log.w("DONE with error: utilisateur non authentifié");
    return next(
      new AppError("Utilisateur non authentifié", {
        statusCode: 401,
      }),
    );
  }

  log.i("IN", { declarationId });

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    const sourceDeclaration = await DemandeSejour.getOne({
      "ds.id": declarationId,
      "o.id": organisme.organismeId,
    });

    if (!sourceDeclaration) {
      log.w("DONE with error");
      return next(
        new AppError("Déclaration non trouvée", {
          statusCode: 404,
        }),
      );
    }

    if (
      sourceDeclaration.statut !== DEMANDE_SEJOUR_STATUTS.BROUILLON &&
      sourceDeclaration.statut !== DEMANDE_SEJOUR_STATUTS.TRANSMISE &&
      sourceDeclaration.statut !== DEMANDE_SEJOUR_STATUTS.EN_COURS &&
      sourceDeclaration.statut !== DEMANDE_SEJOUR_STATUTS.ANNULEE &&
      sourceDeclaration.statut !== DEMANDE_SEJOUR_STATUTS.ABANDONNEE
    ) {
      log.w("DONE with error");
      return next(
        new AppError("Le statut de la déclaration ne permet pas sa copie", {
          statusCode: 404,
        }),
      );
    }

    sourceDeclaration.files = sourceDeclaration.files?.files?.filter(
      (f: any) =>
        f.type !== "declaration_2_mois" && f.type !== "AR_declaration_2_mois",
    );
    const newDeclarationId = await DemandeSejour.copy({
      declaration: sourceDeclaration,
      organisme,
    });
    if (!newDeclarationId) {
      log.w("DONE with error");
      return next(
        new AppError("Erreur de copie", {
          statusCode: 400,
        }),
      );
    }
    await DemandeSejour.insertEvent(
      "Organisateur",
      newDeclarationId,
      userId,
      null,
      "declaration_sejour",
      "creation",
      {},
    );
    log.i("DONE");

    return res.status(200).json({ declarationId: newDeclarationId });
  } catch (err) {
    log.w(err);
    if (err instanceof DatabaseError && err.code === "22001") {
      return next(
        new AppError(
          "Le libellé de la déclaration copiée dépasse la limite de 100 caractères.",
          { name: "LibelleTooLong", statusCode: 400 },
        ),
      );
    }
    return next(
      new AppError("Erreur lors de la duplication de la déclaration", {
        statusCode: 500,
      }),
    );
  }
}
