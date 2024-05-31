const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

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
  const serviceCompetentUserConnected = await serviceCompetence(req.decoded.territoireCode);
  const serviceCompetentUtilisateurUpdate = await serviceCompetence(user.territoireCode);

  if (verifyCompetence(serviceCompetentUserConnected,serviceCompetentUtilisateurUpdate))
  {
    try {
      await BoUser.update(userId, user);
      return res.status(200).json({ message: "Utilisateur mis à jour" });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  }
  else
    return res.status(403).json({ message: "Permission refusée. Privilèges insuffisants" });
};