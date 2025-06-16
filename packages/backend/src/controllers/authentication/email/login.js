const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/User");
const Session = require("../../../services/Session");
const CommonUser = require("../../../services/common/Users");

const logger = require("../../../utils/logger");

const { status } = require("../../../helpers/users");
const { schema } = require("../../../helpers/schema");
const { buildAccessToken, buildRefreshToken } = require("../../../utils/token");
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

  try {
    const verifAttempt = await CommonUser.verifyLoginAttempt(
      email,
      schema.FRONT,
    );
    if (verifAttempt) {
      log.w("Trop de tentatives de connexion");
      return next(
        new AppError("Trop de tentatives de connexion", {
          name: "TooManyLoginAttempts",
          statusCode: 429,
        }),
      );
    }

    const user = await User.login({ email, password });

    if (!user) {
      log.w("Utilisateur inexistant");
      const ip =
        req.headers["x-forwarded-for"]?.split(",").shift() || // Si derrière un proxy
        req.socket?.remoteAddress || // Sinon, l'IP directe
        null;
      await CommonUser.recordLoginAttempt(email, ip, schema.FRONT);
      return next(
        new AppError("Mauvais identifiants", {
          name: "WrongCredentials",
          statusCode: 404,
        }),
      );
    }

    log.d({ user });
    if (
      user.statusCode === status.NEED_EMAIL_VALIDATION ||
      user.statusCode === status.NEED_SIRET_VALIDATION
    ) {
      log.w("Compte non validé");
      return next(
        new AppError("Compte inactif", {
          name: "NeedEmailValidation",
          statusCode: 400,
        }),
      );
    }
    if (user.statusCode === status.BLOCKED) {
      log.w("Compte bloqué");
      return next(
        new AppError("Compte bloqué", {
          name: "EmailUnauthorized",
          statusCode: 400,
        }),
      );
    }
    const accessToken = jwt.sign(buildAccessToken(user), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
    });

    const refreshToken = jwt.sign(buildRefreshToken(user), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.refreshToken.expiresIn / 1000,
    });

    await Session.create(user.id, refreshToken);

    res.cookie("VAO_access_token", accessToken, {
      httpOnly: true,
      maxAge: config.accessToken.expiresIn,
      sameSite: "strict",
      secure: true,
    });

    res.cookie("VAO_refresh_token", refreshToken, {
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
