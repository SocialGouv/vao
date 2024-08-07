const Message = require("../../services/Message");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { declarationId, origin } = req.params;

  if (!declarationId) {
    log.w("missing or invalid parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    await Message.markAsRead(declarationId, origin);
    return res.status(200).json({ readMessages: true });
  } catch (error) {
    log.w("DONE with error");
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la lecture des messages",
    });
  }
};
