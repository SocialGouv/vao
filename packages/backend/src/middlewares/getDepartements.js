const AppError = require("../utils/error");
const logger = require("../utils/logger");
const Departement = require("../services/geo/Departement");

const log = logger(module.filename);

async function getDepartementByTerritoireCode(territoireCode) {
  if (territoireCode === "FRA") {
    return await Departement.fetch();
  }

  if (
    /^[0-9]+$/.test(territoireCode) ||
    territoireCode === "2A" ||
    territoireCode === "2B"
  ) {
    return await Departement.fetch({ value: territoireCode });
  }

  return await Departement.fetch({ region: territoireCode });
}

async function getDepartements(req, res, next) {
  const { decoded } = req;
  log.i("IN");
  try {
    if (!decoded.territoireCode) {
      log.i("DONE - Aucun territoire associé");

      throw new AppError("Utilisateur sans territoire", {
        name: "UnsignedUser",
        statusCode: 401,
      });
    }

    Object.assign(req, {
      departements: await getDepartementByTerritoireCode(
        decoded.territoireCode,
      ),
    });
    next();
  } catch (error) {
    return next(error);
  }
}

module.exports = getDepartements;
