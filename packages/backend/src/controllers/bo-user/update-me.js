const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const BOUserSchema = require("../../schemas/bo-user");

const log = logger(module.filename);

module.exports = async function updateMe(req, res, next) {
  log.i("IN", req.body);
  const { id } = req.decoded;
  let user;
  if (id) {
    try {
      user = await BOUserSchema()
        .omit(["email", "deleted", "roles", "territoireCode"])
        .validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
    } catch (error) {
      log.w(error);
      return next(new ValidationAppError(error));
    }
    try {
      await BoUser.updateMe(id, user);
      return res.status(200).json({ message: "Utilisateur mis à jour" });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  } else
    return res.status(403).json({
      message: "Permission refusée. Utilisateur non reconnu",
    });
};
