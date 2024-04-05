const jwt = require("jsonwebtoken");

const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");
const MailUtils = require("../../utils/mail");
const Send = require("../../services/mail").mailService.send;
const { buildEmailToken } = require("../../utils/bo-token");

const BOUserSchema = require("../../schemas/bo-user");
const config = require("../../config");

const log = logger(module.filename);

module.exports = async function create(req, res, next) {
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

    try {
      const email = user.email;
      const token = jwt.sign(
        buildEmailToken(email),
        config.validationToken.secret,
        {
          expiresIn: config.validationToken.expiresIn / 1000,
        },
      );

      await Send(
        MailUtils.bo.authentication.sendValidationMail({
          email,
          token,
        }),
      );
    } catch (error) {
      log.w(error.name, error.message);
    }

    return res.status(200).json({ message: "Utilisateur créé" });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération d'utilisateur' des utilisateurs BO",
    });
  }
};
