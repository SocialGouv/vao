const { statuts } = require("../../helpers/ds-statuts");
const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId } = req.decoded;

  log.i("IN", { declarationId });

  try {
    const declaration = await DemandeSejour.getOne({
      "ds.id": declarationId,
    });

    if (!declaration) {
      log.w("DONE with error");
      return next(
        new AppError("Déclaration non trouvée", {
          statusCode: 404,
        }),
      );
    }
    log.i(declaration.statut);
    if (declaration.statut !== statuts.BROUILLON) {
      log.w("DONE with error");
      return next(
        new AppError(
          "Impossible de supprimer une demande qui n'est pas au statut BROUILLON",
          {
            statusCode: 400,
          },
        ),
      );
    }
    const deletedRows = await DemandeSejour.delete(declaration.id, userId);
    if (deletedRows !== 1) {
      log.w(`DONE with error, ${deletedRows} rows were deleted, expected one `);
      return next(
        new AppError(
          "Erreur de suppression, trop de lignes supprimées ou pas assez",
          {
            statusCode: 400,
          },
        ),
      );
    }
    log.i("DONE");
    return res.status(200).json({ deletedRows });
  } catch (err) {
    log.w(err);
    return next(
      new AppError("Erreur de suppression", {
        statusCode: 400,
      }),
    );
  }
};
