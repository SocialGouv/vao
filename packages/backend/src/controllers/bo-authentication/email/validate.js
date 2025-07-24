const jwt = require("jsonwebtoken");
const config = require("../../../config");
const User = require("../../../services/BoUser");

const AppError = require("../../../utils/error");

const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { token: validationToken } = req.body;
  log.i("IN", { validationToken });
  if (!validationToken) {
    log.w("missing parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const { email } = await jwt.verify(validationToken, config.tokenSecret, {
      algorithm: config.algorithm,
    });
    log.d({ email });
    const user = await User.activate(email);
    log.d({ user });
    log.i("DONE");
    return res.status(200).json({ user });
  } catch (error) {
    log.w("DONE with error");
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Token expiré", {
          name: "TokenExpiredError",
          statusCode: 401,
        }),
      );
    }
    return next(error);
  }
};
