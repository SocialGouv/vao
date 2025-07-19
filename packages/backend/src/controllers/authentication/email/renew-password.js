const jwt = require("jsonwebtoken");

const User = require("../../../services/User");

const config = require("../../../config");
const passwordSchema = require("../../../schemas/parts/password");

const AppError = require("../../../utils/error");
const ValidationAppError = require("../../../utils/validation-error");
const logger = require("../../../utils/logger");
const { status } = require("../../../helpers/users");

const log = logger(module.filename);

module.exports = async function register(req, res, next) {
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
      algorithm: "ES512",
    });
    log.d({ email });
    const ip =
      req.headers["x-forwarded-for"]?.split(",").shift() || // Si derrière un proxy
      req.socket?.remoteAddress || // Sinon, l'IP directe
      null;
    let user = await User.editPassword({ email, ip, password });
    if (
      user.statusCode !== status.VALIDATED &&
      user.statusCode !== status.NEED_SIRET_VALIDATION
    ) {
      user = await User.activate(email);
    }
    log.d({ user });
    log.i("DONE");
    return res.status(200).json({ user });
  } catch (err) {
    log.w("DONE with error");
    if (err instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Token expiré", {
          name: "TokenExpiredError",
          statusCode: 400,
        }),
      );
    }
    return next(err);
  }
};
