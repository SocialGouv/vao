const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/BoUser");
const Session = require("../../../services/BoSession");

const logger = require("../../../utils/logger");

const { status } = require("../../../helpers/users");
const {
  buildAccessToken,
  buildRefreshToken,
} = require("../../../utils/bo-token");
const AppError = require("../../../utils/error");

const log = logger(module.filename);

module.exports = async function login(req, res, next) {
  const { email, password } = req.body;
  log.i("IN", { email });
  if (!email || !password) {
    log.w("Paramètes manquants");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let user;
  try {
    user = await User.login({ email, password });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    log.w("Utilisateur BO inexistant");
    return next(
      new AppError("Mauvais identifiants", {
        name: "WrongCredentials",
        statusCode: 404,
      }),
    );
  }

  log.d({ user });
  if (user.statusCode === status.NEED_EMAIL_VALIDATION) {
    log.w("Compte non validé");
    return next(
      new AppError("Compte non validé", {
        name: "NotValidatedAccount",
        statusCode: 400,
      }),
    );
  }

  user.serviceCompetent = (user.territoireCode === "FRA") ? 'NAT' : (/^[0-9]+$/.test(user.territoireCode)) ? 'DEP' : 'REG';

  try {
    const accessToken = jwt.sign(buildAccessToken(user), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
    });

    const refreshToken = jwt.sign(buildRefreshToken(user), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.refreshToken.expiresIn / 1000,
    });

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
    log.w("DONE with error");
    return next(error);
  }
};
