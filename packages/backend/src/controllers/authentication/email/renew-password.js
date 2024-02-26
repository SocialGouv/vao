const jwt = require("jsonwebtoken");

const User = require("../../../services/User");

const config = require("../../../config");
const passwordSchema = require("../../../schemas/parts/password");

const AppError = require("../../../utils/error");
const ValidationAppError = require("../../../utils/validation-error");
const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async function register(req, res, next) {
  const { token: resetPasswordToken } = req.query;
  const { password } = req.body;
  log.i("In", { resetPasswordToken });
  if (!resetPasswordToken) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètres incorrects" });
  }

  try {
    await passwordSchema.validate(password);
  } catch (error) {
    log.w("Done with error", { cause: error });
    return next(new ValidationAppError(error));
  }

  try {
    const { email } = await jwt.verify(
      resetPasswordToken,
      `${config.resetPasswordToken.secret}`,
    );
    log.d({ email });
    const user = await User.editPassword({ email, password });
    log.d({ user });
    log.i("Done");
    return res.status(200).json({ user });
  } catch (err) {
    log.w(err);
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ code: "TokenExpiredError" });
    }
    if (err instanceof AppError) {
      return res.status(400).json({ code: err.name });
    }
    return res.status(400).json({ message: "Une erreur est survenue" });
  }
};
