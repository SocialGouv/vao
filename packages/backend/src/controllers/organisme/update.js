const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function update(req, res, next) {
  log.i("IN", req.body);
  const { body } = req;
  const organismeId = req.params.organismeId;
  const { type, parametre } = body;

  if (!type || !parametre || !organismeId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    await Organisme.update(type, parametre, organismeId);
    return res.status(200).json({
      message: "sauvegarde organisme OK",
      organismeId,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
