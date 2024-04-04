const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const BOUserSchema = require("../../schemas/bo-user");

const log = logger(module.filename);

module.exports = async function update(req, res, next) {
  log.i("IN", req.body);
  let user;

  try {
    user = await BOUserSchema().validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    await BoUser.create(user);
    return res.status(200).json({ message: "Utilisateur créé" });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération d'utilisateur' des utilisateurs BO",
    });
  }
};