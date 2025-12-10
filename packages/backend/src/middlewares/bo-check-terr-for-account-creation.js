const logger = require("../utils/logger");
const AppError = require("../utils/error").default;

const log = logger(module.filename);

function checkTerrForAccountCreation(req, res, next) {
  const { territoireCode } = req.decoded;
  const { departements } = req;
  const userToCreateTerrCode = req.body.territoireCode;

  log.i("IN", { territoireCode });

  const canCreate =
    territoireCode === "FRA" ||
    (territoireCode && territoireCode.toString() === userToCreateTerrCode) ||
    (departements &&
      Array.isArray(departements) &&
      departements.map((d) => d.value).includes(userToCreateTerrCode));

  if (!canCreate) {
    return next(
      new AppError(
        "L'administrateur ne peut pas créer de comptes en dehors de son territoire",
        {
          statusCode: 403,
        },
      ),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkTerrForAccountCreation;
