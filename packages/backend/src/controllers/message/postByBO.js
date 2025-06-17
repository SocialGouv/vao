const DeclarationSejourService = require("../../services/DemandeSejour");
const MailUtils = require("../../utils/mail");
const postMessage = require("../../helpers/postMessage");

module.exports = function postBO(req, res, next) {
  return postMessage({
    getDestinataires: (declaration) =>
      DeclarationSejourService.getEmailToList(declaration.organismeId),
    getMailPayload: ({ declaration, destinataires, message }) =>
      MailUtils.usagers.declarationSejour.sendMessageNotify({
        declaration,
        destinataires,
        message,
      }),
    next,
    req,
    res,
    source: "back",
  });
};
