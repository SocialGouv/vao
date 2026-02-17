const Message = require("../services/Message");
const DeclarationSejourService = require("../services/DemandeSejour");
const Send = require("../services/mail").mailService.send;
const logger = require("../utils/logger");
const AppError = require("../utils/error").default;
const MessageSchema = require("../schemas/message");
const ValidationAppError = require("../utils/validation-error").default;

const log = logger(module.filename);

async function postMessage({
  req,
  res,
  next,
  source,
  getDestinataires,
  getMailPayload,
}) {
  log.i("IN");
  const { body, decoded } = req;
  const { declarationId } = req.params;
  const userId = decoded.id;

  let messageData;

  try {
    messageData = await MessageSchema.schema().validate(
      {
        declaration_id: declarationId,
        file: body.file,
        message: body.message,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  const { message, file } = messageData;

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
    id = await Message.post(declarationId, userId, message, file, source);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
  try {
    const destinataires = await getDestinataires(declaration);

    if (destinataires && destinataires.length > 0) {
      await Send(getMailPayload({ declaration, destinataires, message }));
    }
  } catch (error) {
    log.w("erreur sur l'envoi de mail :", error);
    return next(error);
  }
  return res.status(200).json({
    id,
    message: "message envoyé",
  });
}

module.exports = postMessage;
