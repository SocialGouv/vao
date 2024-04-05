const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/BoUser");
const Send = require("../../../services/mail").mailService.send;

const logger = require("../../../utils/logger");
const MailUtils = require("../../../utils/mail");
const { buildEmailToken } = require("../../../utils/bo-token");

const log = logger(module.filename);

module.exports = async function forgottenPassword(req, res, next) {
  const { email } = req.body;
  log.i("In", { email });
  if (!email) {
    log.w("email manquant");
    return res.status(400).json({ message: "Paramète manquant" });
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
    const token = jwt.sign(
      buildEmailToken(email),
      config.resetPasswordToken.secret,
      {
        expiresIn: config.resetPasswordToken.expiresIn / 1000,
      },
    );
    await Send(
      MailUtils.bo.authentication.sendForgottenPassword({
        email,
        token,
      }),
    );

    log.i("DONE");

    return res.json({ message: "Mail envoyé" });
  } catch (error) {
    log.w(error);
    return res.status(500).json({ code: "DefaultError" });
  }
};
