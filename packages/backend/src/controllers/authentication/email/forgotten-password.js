const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/User");
const Send = require("../../../services/mail").mailService.send;

const logger = require("../../../utils/logger");
const normalize = require("../../../utils/normalize");
const MailUtils = require("../../../utils/mail");
const { buildEmailToken } = require("../../../utils/token");
const AppError = require("../../../utils/error");

const log = logger(module.filename);

module.exports = async function login(req, res, next) {
  const { email } = req.body;
  log.i("IN", { email });
  if (!email) {
    log.w("email manquant");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  const users = await User.read({ mail: normalize(email) });

  if (users.length === 0) {
    log.w("Utilisateur inexistant");
    return res.json({ message: "Mail envoyé" });
  }
  const [user] = users;

  log.d({ user });

  try {
    const token = jwt.sign(buildEmailToken(email), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.resetPasswordToken.expiresIn / 1000,
    });
    await Send(
      MailUtils.usagers.authentication.sendForgottenPassword({
        email,
        token,
      }),
    );

    log.i("DONE");

    return res.json({ message: "Mail envoyé" });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
