const FoUser = require("../../services/FoUser");
const Territoire = require("../../services/Territoire");
const logger = require("../../utils/logger");
const MailUtils = require("../../utils/mail");
const Send = require("../../services/mail").mailService.send;

const { status: refStatus } = require("../../helpers/users");

const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function updateStatus(req, res, next) {
  log.i("IN");
  const { status, motif } = req.query;
  const { userId } = req.params;
  const { id: userBackId } = req.decoded;
  try {
    const { user } = await FoUser.updateStatus(
      userId,
      status,
      motif,
      userBackId,
    );
    const territoire = await Territoire.readFicheIdByTerCode(user.ter_code);
    const detailTerritoire = await Territoire.readOne(territoire.id);
    if (status === refStatus.VALIDATED) {
      try {
        await Send(
          MailUtils.usagers.newVaoAccount.sendNewAccountValided(user.mail),
        );
      } catch (error) {
        return next(
          new AppError("Erreur lors de l'envoi du mail de validation", {
            cause: error,
            name: "MailError",
            statusCode: 500,
          }),
        );
      }
    }
    if (status === refStatus.BLOCKED) {
      try {
        await Send(
          MailUtils.usagers.newVaoAccount.sendNewAccountBlocked(
            user.mail,
            motif,
            detailTerritoire.text,
          ),
        );
      } catch (error) {
        return next(
          new AppError("Erreur lors de l'envoi du mail de refus", {
            cause: error,
            name: "MailError",
            statusCode: 500,
          }),
        );
      }
    }

    return res.status(200).json({
      message: "Email sent",
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
