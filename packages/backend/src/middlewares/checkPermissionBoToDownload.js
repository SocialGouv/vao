const logger = require("../utils/logger");
const AppError = require("../utils/error");
//const pool = require("../utils/pgpool").getPool();
//const BoUser = require("../services/BoUser");
const Document = require("../services/Document");
const documentsHelper = require("../helpers/documents");
const documentsHandler = require("../utils/documents");
//const { Tables } = require("../helpers/tables");
//const { DroitsGroup } = require("../helpers/droits");
const droitsHandler = require("../utils/droits");

const log = logger(module.filename);

async function checkPermissionBoToDownload(req, res, next) {
  console.log("checkPermissionBoToDownload IN");
  const { decoded } = req;
  const { uuid } = req.params;
  const { id: userId, territoireCode } = decoded ?? {};
  console.log("req.params", req?.params);
  console.log("req.body", req?.body);
  // TODO: contrôle des paramètres de recherche
  log.d({ territoireCode, userId, uuid });
  if (!userId && !territoireCode && !uuid) {
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  let category;
  let fileMetaData;
  try {
    fileMetaData = await Document.getFileMetaData(uuid);
    console.log("fileMetaData", fileMetaData);
    if (!fileMetaData) {
      return next(new AppError("Fichier introuvable", { statusCode: 404 }));
    }
    category = fileMetaData.category;
    if (!category) {
      return next(
        new AppError("Catégorie de fichier introuvable", { statusCode: 404 }),
      );
    }
  } catch (err) {
    log.w(err);
    return next(
      new AppError("La recherche du fichier a échoué", { cause: err }),
    );
  }
  console.log("category", category);
  // On récupère la catégorie du document
  // Cela va permettre de savoir à quelle table elle est rattachée
  // et donc quel droit est nécessaire pour y accéder
  const categoryDoc = documentsHelper.getCategory(category);
  console.log("categoryDoc", categoryDoc);
  if (!categoryDoc) {
    return next(
      new AppError("Catégorie de document inconnue", { statusCode: 400 }),
    );
  }
  const id = await documentsHandler.processCategoryDoc(
    categoryDoc,
    fileMetaData.uuid,
  );
  console.log("categoryDoc.droit,", categoryDoc.droit);
  const isAllowed = await droitsHandler.isUserAllowedForDroit(
    categoryDoc.droit,
    id,
    userId,
  );

  if (isAllowed) {
    return next();
  } else {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à ce fichier", {
        statusCode: 403,
      }),
    );
  }
}

module.exports = checkPermissionBoToDownload;
