const FoUser = require("../../services/FoUser");
const Territoire = require("../../services/Territoire");
const logger = require("../../utils/logger");
const MailUtils = require("../../utils/mail");
const Send = require("../../services/mail").mailService.send;

const { status: refStatus } = require("../../helpers/users");

const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = function updateStatus(source) {
  return async (req, res, next) => {
    log.i("IN");
    const { status, motif } = req.query;
    const { userId } = req.params;
    const { id: userConnectedId } = req.decoded;

    if (!status || !userId) {
      log.w("missing parameter");
      return next(new AppError("Paramètre manquant", { statusCode: 400 }));
    }

    if (status === refStatus.BLOCKED && !motif) {
      log.w("missing parameter motif");
      return next(
        new AppError("Paramètre manquant motif", { statusCode: 400 }),
      );
    }

    let userFrontId = null;
    let userBackId = null;
    if (source === "BO") {
      userBackId = userConnectedId;
    } else {
      userFrontId = userConnectedId;
    }
    try {
      const { user } = await FoUser.updateStatus(
        userId,
        status,
        motif,
        userBackId,
        userFrontId,
      );
      if (status === refStatus.VALIDATED) {
        await sendValidationEmail(user.mail, next);
      }

      if (status === refStatus.BLOCKED) {
        await sendBlockedEmail(user, motif, source, next);
      }

      return res.status(200).json({ message: "Email sent" });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  };
};

async function sendValidationEmail(email, next) {
  try {
    await Send(MailUtils.usagers.newVaoAccount.sendNewAccountValided(email));
  } catch (error) {
    next(
      new AppError("Erreur lors de l'envoi du mail de validation", {
        cause: error,
        name: "MailError",
        statusCode: 500,
      }),
    );
  }
}

async function sendBlockedEmail(user, motif, source, next) {
  try {
    if (source === "BO") {
      const territoire = await Territoire.readFicheIdByTerCode(user.ter_code);
      const detailTerritoire = await Territoire.readOne(territoire.id);
      await Send(
        MailUtils.usagers.newVaoAccount.sendNewAccountBlockedByDreets(
          user.mail,
          motif,
          detailTerritoire.text,
        ),
      );
    } else {
      await Send(
        MailUtils.usagers.newVaoAccount.sendNewAccountBlockedByOrganisme(
          user.mail,
          motif,
        ),
      );
    }
  } catch (error) {
    next(
      new AppError("Erreur lors de l'envoi du mail de refus", {
        cause: error,
        name: "MailError",
        statusCode: 500,
      }),
    );
  }
}
