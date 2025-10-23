const { ERRORS } = require("@vao/shared-bridge");

const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/BoUser");
const CommonUser = require("../../../services/common/Users");
const Session = require("../../../services/common/Session");

const logger = require("../../../utils/logger");

const { status } = require("../../../helpers/users");
const { schema } = require("../../../helpers/schema");
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
    const verifAttempt = await CommonUser.verifyLoginAttempt(
      email,
      schema.BACK,
    );
    if (verifAttempt) {
      log.w("Trop de tentatives de connexion");
      return next(
        new AppError("Trop de tentatives de connexion", {
          name: ERRORS.TooManyLoginAttempts,
          statusCode: 429,
        }),
      );
    }

    user = await User.login({ email, password });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",").shift() || // Si derrière un proxy
      req.socket?.remoteAddress || // Sinon, l'IP directe
      null;
    await CommonUser.recordLoginAttempt(email, ip, schema.BACK);
    log.w("Utilisateur BO inexistant");
    return next(
      new AppError("Mauvais identifiants", {
        name: ERRORS.WrongCredentials,
        statusCode: 404,
      }),
    );
  }

  log.d({ user });
  if (user.statusCode === status.NEED_EMAIL_VALIDATION) {
    log.w("Compte non validé");
    return next(
      new AppError("Compte non validé", {
        name: ERRORS.NeedEmailValidation,
        statusCode: 400,
      }),
    );
  }

  try {
    const accessToken = jwt.sign(
      buildAccessToken(user),
      config.tokenSecret_BO,
      {
        algorithm: config.algorithm,
        expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
      },
    );

    const refreshToken = jwt.sign(
      buildRefreshToken(user),
      config.tokenSecret_BO,
      {
        algorithm: config.algorithm,
        expiresIn: config.refreshToken.expiresIn / 1000,
      },
    );

    await Session.create(user.id, refreshToken, schema.BACK);

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
