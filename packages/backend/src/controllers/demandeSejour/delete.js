const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const demandeSejourId = req.params.id;

  log.i("IN", { demandeSejourId });

  try {
    const declaration = await DemandeSejour.getOne({
      "ds.id": demandeSejourId,
    });

    if (!declaration) {
      log.w("DONE with error");
      return next(
        new AppError("Déclaration non trouvée", {
          statusCode: 404,
        }),
      );
    }
    const deletedRows = await DemandeSejour.delete(declaration.id);
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
