const jwt = require("jsonwebtoken");
const config = require("../../../config");
const User = require("../../../services/BoUser");

const AppError = require("../../../utils/error");

const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res) => {
  const { token: validationToken } = req.body;
  log.i("In", { validationToken });
  if (!validationToken) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètres incorrects" });
  }
  try {
    const { email } = await jwt.verify(
      validationToken,
      `${config.validationToken.secret}`,
    );
    log.d({ email });
    const user = await User.activate(email);
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
