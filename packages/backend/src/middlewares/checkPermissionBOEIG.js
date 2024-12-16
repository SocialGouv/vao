const logger = require("../utils/logger");
const AppError = require("../utils/error");
const { getById } = require("../services/eig");
const { statuts, mustMarkAsRead } = require("../helpers/eig");

const log = logger(module.filename);

async function checkPermissionEIG(req, res, next) {
  const { id: userId, territoireCode } = req.decoded;
  const { id: eigId } = req.params;

  if (!eigId || isNaN(eigId)) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet EIG", {
        statusCode: 400,
      }),
    );
  }

  log.i("IN", { eigId, userId });

  let eig;

  try {
    eig = await getById({ eigId });
  } catch (err) {
    return res.status(400).send({ errors: err.errors, name: err.name });
  }

  if (!eig) {
    log.w("EIG introuvable");
    return next(
      new AppError("Not found", {
        statusCode: 400,
      }),
    );
  }

  if (eig.statut === statuts.BROUILLON) {
    log.w("L'EIG a un statut brouillon et ne peut pas être lu");
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  if (mustMarkAsRead(territoireCode, eig)) {
    log.w("L'EIG doit d'abord être marqué comme lu");
    return next(
      new AppError("l'EIG doit d'abord être marqué comme lu", {
        statusCode: 400,
      }),
    );
  }

  log.i("DONE");
  next();
}

module.exports = checkPermissionEIG;
