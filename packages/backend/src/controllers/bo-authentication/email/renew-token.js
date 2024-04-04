const jwt = require("jsonwebtoken");

const User = require("../../../services/BoUser");
const Send = require("../../../services/mail").mailService.send;

const config = require("../../../config");
const { status } = require("../../../helpers/users");

const MailUtils = require("../../../utils/mail");
const AppError = require("../../../utils/error");
const logger = require("../../../utils/logger");
const { buildEmailToken } = require("../../../utils/bo-token");

const log = logger(module.filename);

module.exports = async function renewToken(req, res, next) {
  const { email } = req.body;
  log.i("IN", { email });
  try {
    if (!email) {
      throw new AppError("Paramètres manquants", {
        name: "MalformedQuery",
      });
    }

    const [user] = await User.read({ search: { email } });
    log.d({ user });
    if (!user) {
      throw new AppError("Utilisateur non trouvé", {
        name: "UserNotFound",
      });
    }
    if (user.statusCode !== status.NEED_EMAIL_VALIDATION) {
      throw new AppError("Utilisateur déjà actif", {
        name: "UserAlreadyVerified",
      });
    }
    const token = jwt.sign(
      buildEmailToken(email),
      config.validationToken.secret,
      {
        expiresIn: config.validationToken.expiresIn / 1000,
      },
    );
    try {
      await Send(
        MailUtils.bo.authentication.sendValidationMail({ email, token }),
      );
    } catch (error) {
      log.w(error.name, error.message);
    }
    log.i("DONE");
    return res.status(200).json({ message: "Email envoyé avec succès." });
  } catch (error) {
    log.w("DONE with error", error.name, error.message);
    return next(error);
  }
};
