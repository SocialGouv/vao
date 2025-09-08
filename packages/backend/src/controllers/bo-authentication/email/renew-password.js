const jwt = require("jsonwebtoken");

const User = require("../../../services/BoUser");

const config = require("../../../config");
const passwordSchema = require("../../../schemas/parts/password");

const AppError = require("../../../utils/error");
const ValidationAppError = require("../../../utils/validation-error");
const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async function renewPassword(req, res, next) {
  const { token: resetPasswordToken } = req.query;
  const { password } = req.body;
  log.i("IN", { resetPasswordToken });
  if (!resetPasswordToken) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    await passwordSchema().validate(password);
  } catch (error) {
    log.w("Done with error", { cause: error });
    return next(new ValidationAppError(error));
  }

  try {
    const { email } = await jwt.verify(resetPasswordToken, config.tokenSecret, {
      algorithm: config.algorithm,
    });
    log.d({ email });
    await User.editPassword(email, password);
    log.i("DONE");
    return res.status(200).json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    log.w("DONE with error");
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ name: "TokenExpiredError" });
    }
    return next(error);
  }
};
