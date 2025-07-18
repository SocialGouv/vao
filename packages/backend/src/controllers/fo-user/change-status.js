const FoUser = require("../../services/FoUser");
const logger = require("../../utils/logger");

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
  try {
    await FoUser.updateStatus(
      userId,
      status,
      "Désactivation",
      null,
      userConnectedId,
    );

    return res.status(200).json({ message: "Status updated" });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
