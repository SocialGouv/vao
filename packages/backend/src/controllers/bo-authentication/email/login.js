const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/BoUser");
const Session = require("../../../services/BoSession");

const logger = require("../../../utils/logger");

const { status } = require("../../../helpers/users");
const { buildAccessToken, buildRefreshToken } = require("../../../utils/token");

const log = logger(module.filename);

module.exports = async function login(req, res) {
  const { email, password } = req.body;
  log.i("In", { email });
  if (!email || !password) {
    log.w("Paramètes manquants");
    return res.status(400).json({ message: "Paramètes manquants" });
  }

  const user = await User.login({ email, password });

  if (!user) {
    log.w("Utilisateur BO inexistant");
    return res.status(404).json({ code: "WrongCredentials" });
  }

  log.d({ user });
  if (user.statusCode === status.NEED_EMAIL_VALIDATION) {
    log.w("Compte non validé");
    return res.status(400).json({
      name: "NotValidatedAccount",
    });
  }

  try {
    const accessToken = jwt.sign(
      buildAccessToken(user),
      config.accessToken.secret,
      {
        expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
      },
    );

    const refreshToken = jwt.sign(
      buildRefreshToken(user),
      config.refreshToken.secret,
      {
        expiresIn: config.refreshToken.expiresIn / 1000,
      },
    );

    await Session.create(user.id, refreshToken);

    res.cookie("VAO_BO_access_token", accessToken, {
      httpOnly: true,
      maxAge: config.accessToken.expiresIn,
      sameSite: "strict",
      secure: true,
    });

    res.cookie("VAO_BO_refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: config.refreshToken.expiresIn,
      sameSite: "strict",
      secure: true,
    });

    log.i("DONE");

    return res.json({ user });
  } catch (error) {
    log.w(error);
    return res.status(500).json({ code: "DefaultError" });
  }
};
