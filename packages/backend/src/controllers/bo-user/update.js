const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error").default;
const Send = require("../../services/mail").mailService.send;
const MailUtils = require("../../utils/mail");
const BOUserSchema = require("../../schemas/bo-user");
const serviceCompetence = require("./service-competence");
const verifyCompetence = require("./service-competence");

const log = logger(module.filename);

module.exports = async function update(req, res, next) {
  log.i("IN", req.body);
  const userId = req.params.userId;
  let user;
  try {
    user = await BOUserSchema().omit(["email"]).validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    log.w(error);
    return next(new ValidationAppError(error));
  }
  const serviceCompetentUserConnected = await serviceCompetence(
    req.decoded.territoireCode,
  );
  const serviceCompetentUtilisateurUpdate = await serviceCompetence(
    user.territoireCode,
  );

  if (
    verifyCompetence(
      serviceCompetentUserConnected,
      serviceCompetentUtilisateurUpdate,
    )
  ) {
    let userBeforeUpdate = null;
    try {
      userBeforeUpdate = await BoUser.getByUserId(userId);
    } catch (error) {
      log.w("Utilisateur inexistant");
      return next(error);
    }
    try {
      await BoUser.update(userId, user, req.decoded.id);
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
    if (user.deleted && !userBeforeUpdate.deleted && userBeforeUpdate.email) {
      try {
        await Send(
          MailUtils.bo.action.sendAccountDeletionMail({
            email: userBeforeUpdate.email,
          }),
        );
      } catch (error) {
        log.w("Error sending account deletion mail", error);
      }
    }
    log.i("DONE");
    return res.status(200).json({ message: "Utilisateur mis à jour" });
  } else
    return res
      .status(403)
      .json({ message: "Permission refusée. Privilèges insuffisants" });
};
