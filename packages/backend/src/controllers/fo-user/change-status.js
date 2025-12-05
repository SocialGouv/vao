const FoUser = require("../../services/FoUser");
const User = require("../../services/User");
const logger = require("../../utils/logger");
const { TRACKING_ACTIONS, TRACKING_USER_TYPE } = require("@vao/shared-bridge");
const MailUtils = require("../../utils/mail");
const Send = require("../../services/mail").mailService.send;
const AppError = require("../../utils/error");
const { status: userStatus } = require("../../helpers/users");

const log = logger(module.filename);

module.exports = async function changeStatus(req, res, next) {
  log.i("IN");
  const { status } = req.query;
  const { userId } = req.params;
  const { id: userConnectedId } = req.decoded;
  if (!status || !userId) {
    log.w("missing parameter");
    return next(new AppError("Paramètre manquant", { statusCode: 400 }));
  }

  if (!Object.values(userStatus).includes(status)) {
    log.w("invalid status");
    return next(
      new AppError("Status invalide", {
        name: "InvalidStatus",
        statusCode: 400,
      }),
    );
  }
  if (status === userStatus.BLOCKED) {
    const isLastUserOrganisme = await FoUser.getIsLastUserOrganisme(userId);
    if (isLastUserOrganisme) {
      log.w("missing parameter");
      return next(
        new AppError("Dernier utilisateur valide de l'organisme", {
          name: "LastUserOrganisme",
          statusCode: 409,
        }),
      );
    }
  }
  let userBeforeUpdate = null;
  let motif = null;
  try {
    userBeforeUpdate = await FoUser.readOne(userId);
  } catch (err) {
    return next(
      new AppError("Utilisateur inexistant", {
        name: "UserNotFound",
        statusCode: 400,
      }),
    );
  }
  try {
    motif =
      status === userStatus.BLOCKED
        ? "Désactivation"
        : status === userStatus.VALIDATED
          ? "Réactivation"
          : "Changement de statut";
    await FoUser.updateStatus(userId, status, motif, null, userConnectedId);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
  if (
    status === userStatus.BLOCKED &&
    userBeforeUpdate &&
    userBeforeUpdate.email
  ) {
    try {
      await Send(
        MailUtils.usagers.action.sendAccountDeletionMail({
          email: userBeforeUpdate.email,
        }),
      );
    } catch (error) {
      log.w("Error sending account blocked mail", error);
    }
  }
  try {
    User.addAsyncUserHistoric({
      action: TRACKING_ACTIONS.modification,
      data: {
        newData: { motif, status, userConnectedId, userId },
        oldData: userBeforeUpdate,
      },
      foUserId: userId,
      userId: userConnectedId,
      userType: TRACKING_USER_TYPE.front,
    });
  } catch (error) {
    log.w("Error tracking user modification", error);
  }
  return res.status(200).json({ message: "Status updated" });
};
