const Message = require("../../services/Message");
const DeclarationSejourService = require("../../services/DemandeSejour");
const Send = require("../../services/mail").mailService.send;
const MailUtils = require("../../utils/mail");
const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  log.i("IN");
  const { body, decoded } = req;
  const { message, file } = body;
  const { declarationId } = req.params;
  const userId = decoded.id;

  if (!declarationId || (!message && !file)) {
    log.w("missing or invalid parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  const declaration = await DeclarationSejourService.getOne({
    "ds.id": declarationId,
  });
  if (!declaration) {
    log.w(`cannot get declaration ${declarationId} `);
    return next(
      new AppError("declaration inaccessible", {
        statusCode: 400,
      }),
    );
  }

  let id;
  try {
    id = await Message.post(declarationId, userId, message, file, "front");
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
  try {
    const destinataires = await DeclarationSejourService.getEmailBack(
      declaration.departementSuivi,
    );

    if (destinataires && destinataires.length > 0) {
      await Send(
        MailUtils.bo.declarationSejour.sendMessageNotify({
          declaration,
          destinataires,
          message,
        }),
      );
    }
  } catch (error) {
    log.w("erreur sur l'envoi de mail au service déconcentré :", error);
  }
  return res.status(200).json({
    id,
    message: "message envoyé",
  });
};
