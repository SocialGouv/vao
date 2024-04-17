const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const BOUserSchema = require("../../schemas/bo-user");

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

  try {
    await BoUser.update(userId, user);
    return res.status(200).json({ message: "Utilisateur mis à jour" });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
