const jwt = require("jsonwebtoken");

const User = require("../../../services/User");
const Send = require("../../../services/mail").mailService.send;

const config = require("../../../config");
const { status } = require("../../../helpers/users");

const MailUtils = require("../../../utils/mail");
const AppError = require("../../../utils/error");
const logger = require("../../../utils/logger");
const normalize = require("../../../utils/normalize");
const { buildEmailToken } = require("../../../utils/token");

const log = logger(module.filename);

module.exports = async function register(req, res) {
  const { email } = req.body;
  log.i("IN", { email });
  if (!email) {
    return res.status(400).json({ message: "Paramètres manquants" });
  }
  try {
    const [user] = await User.read({ mail: normalize(email) });
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
        MailUtils.usagers.authentication.sendValidationMail({ email, token }),
      );
    } catch (error) {
      log.w(error.name, error.message);
    }
    log.i("DONE");
    return res.status(200).json({ message: "Email envoyé avec succès." });
  } catch (error) {
    log.w(error);
    if (error instanceof AppError) {
      return res.status(400).json({ code: error.name });
    }
    return res.status(400).json({ message: "Une erreur est survenue." });
  }
};
