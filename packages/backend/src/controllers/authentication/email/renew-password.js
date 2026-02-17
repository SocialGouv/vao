const jwt = require("jsonwebtoken");

const User = require("../../../services/User");

const config = require("../../../config");
const passwordSchema = require("../../../schemas/parts/password");

const AppError = require("../../../utils/error").default;
const ValidationAppError = require("../../../utils/validation-error").default;
const logger = require("../../../utils/logger");
const { canBeActivated } = require("../../../utils/canBeActivated");

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
      algorithm: config.algorithm,
    });
    log.d({ email });
    let user = await User.editPassword({ email, password });
    if (canBeActivated(user.statusCode)) {
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
