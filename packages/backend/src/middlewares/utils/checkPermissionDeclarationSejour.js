const logger = require("../../utils/logger");
const AppError = require("../../utils/error").default;
const Organisme = require("../../services/Organisme");
const DemandeSejour = require("../../services/DemandeSejour");

const log = logger(module.filename);

const checkPermissionDeclarationSejourUtils = async (
  userId,
  declarationId,
  next,
) => {
  log.i("IN");

  if (!declarationId) {
    return next(
      new AppError(
        "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
        {
          statusCode: 403,
        },
      ),
    );
  }
  const organisme = await Organisme.getOne({
    use_id: userId,
  });

  const siren =
    organisme.typeOrganisme === "personne_morale" &&
    organisme.personneMorale?.porteurAgrement === true
      ? organisme.personneMorale?.siren
      : "";

  const sejour = await DemandeSejour.getByIdOrUserSiren(
    declarationId,
    siren,
    userId,
  );

  if (!sejour || sejour.length !== 1) {
    return next(
      new AppError(
        "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
        {
          statusCode: 403,
        },
      ),
    );
  }
  log.i("DONE");
  next();
};

//default export
module.exports.checkPermissionDeclarationSejourUtils =
  checkPermissionDeclarationSejourUtils;
