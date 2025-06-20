const DeclarationSejourService = require("../../services/DemandeSejour");
const MailUtils = require("../../utils/mail");
const postMessage = require("../../helpers/postMessage");

module.exports = function postFO(req, res, next) {
  return postMessage({
    getDestinataires: (declaration) =>
      DeclarationSejourService.getEmailBack(declaration.departementSuivi),
    getMailPayload: ({ declaration, destinataires, message }) =>
      MailUtils.bo.declarationSejour.sendMessageNotify({
        declaration,
        destinataires,
        message,
      }),
    next,
    req,
    res,
    source: "front",
  });
};
