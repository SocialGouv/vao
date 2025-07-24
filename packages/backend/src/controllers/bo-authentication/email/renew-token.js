const jwt = require("jsonwebtoken");

const User = require("../../../services/BoUser");
const Send = require("../../../services/mail").mailService.send;

const config = require("../../../config");

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
      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const user = await User.readOneByMail(email);
    log.d({ user });
    const token = jwt.sign(buildEmailToken(email), config.tokenSecret, {
      algorithm: config.algorithm,
      expiresIn: config.validationToken.expiresIn / 1000,
    });
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
    log.w("DONE with error");
    return next(error);
  }
};
