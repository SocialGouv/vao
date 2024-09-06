const BoUser = require("../../services/BoUser");

const AppError = require("../../utils/error");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getOne(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId, territoireCode } = decoded ?? {};
  log.d({ adminId });

  try {
    // TODO: contrôle des paramètres de recherche
    const userId = req.params.userId;
    log.d({ territoireCode, userId });

    if (!userId) {
      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const user = await BoUser.readOne(userId, territoireCode);
    log.d("Done");
    return res.status(200).json(user);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
