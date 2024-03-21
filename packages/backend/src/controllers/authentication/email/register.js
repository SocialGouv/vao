const jwt = require("jsonwebtoken");

const User = require("../../../services/User");
const Send = require("../../../services/mail").mailService.send;

const config = require("../../../config");
const registerSchema = require("../../../schemas/register");

const logger = require("../../../utils/logger");
const MailUtils = require("../../../utils/mail");
const { buildEmailToken } = require("../../../utils/token");
const ValidationAppError = require("../../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function register(req, res, next) {
  log.i("IN");
  const { email, password, nom, prenom, telephone } = req.body;

  const part = { email, nom, password, prenom, telephone };
  try {
    await registerSchema.validate(part);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const { user, code } = await User.registerByEmail({
      email,
      nom,
      password,
      prenom,
      telephone,
    });

    log.d({ user });
    const token = jwt.sign(
      buildEmailToken(email),
      config.validationToken.secret,
      {
        expiresIn: config.validationToken.expiresIn / 1000,
      },
    );
    try {
      await Send(
        MailUtils.usagers.authentication.sendValidationMail({
          email,
          token,
        }),
      );
    } catch (error) {
      log.w(error.name, error.message);
      return res.status(400).json({
        code: "MailError",
      });
    }
    log.i("DONE");
    return res.status(200).json({ code });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      code: "DefaultError",
    });
  }
};
