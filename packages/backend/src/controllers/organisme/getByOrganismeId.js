const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const organismeId = req.params.organismeId;
  const { decoded } = req;
  const { id: userId } = decoded;
  if (!organismeId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const organisme = await Organisme.get({
      id: organismeId,
      use_id: userId,
    });
    log.d(organisme);
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
