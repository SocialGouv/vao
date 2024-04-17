const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/BoUser");
const Send = require("../../../services/mail").mailService.send;

const logger = require("../../../utils/logger");
const MailUtils = require("../../../utils/mail");
const { buildEmailToken } = require("../../../utils/bo-token");
const AppError = require("../../../utils/error");

const log = logger(module.filename);

module.exports = async function forgottenPassword(req, res, next) {
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

  let user;
  try {
    user = await User.readOneByMail(email);
  } catch (error) {
    if (error.isOperational && error.name === "UserNotFound") {
      log.w("DONE - UserNotFound");
      return res.json({ message: "Mail envoyé" });
    } else {
      return next(error);
    }
  }
  log.d({ user });

  try {
    const token = jwt.sign(buildEmailToken(email), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.resetPasswordToken.expiresIn / 1000,
    });
    await Send(
      MailUtils.bo.authentication.sendForgottenPassword({
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
