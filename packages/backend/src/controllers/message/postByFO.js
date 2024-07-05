const Message = require("../../services/Message");
const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  log.i("IN");
  const { body, decoded } = req;
  const { message } = body;
  const declarationId = req.params.declarationId;
  const userId = decoded.id;

  if (!declarationId || !message || message.length === 0) {
    log.w("missing or invalid parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    const id = await Message.post(declarationId, userId, message, "front");
    return res.status(200).json({
      id,
      message: "message envoyé",
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
