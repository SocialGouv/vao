const { ERRORS_LOGIN } = require("@vao/shared-bridge");

const config = require("../../../config");

const User = require("../../../services/BoUser");
const CommonUser = require("../../../services/common/Users");
const Session = require("../../../services/common/Session");

const logger = require("../../../utils/logger");

const { status } = require("../../../helpers/users");
const { schema } = require("../../../helpers/schema");
const {
  signAccessToken,
  signRefreshToken,
} = require("../../../utils/bo-token");
const AppError = require("../../../utils/error").default;

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
          name: ERRORS_LOGIN.TooManyLoginAttempts,
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
        name: ERRORS_LOGIN.WrongCredentials,
        statusCode: 404,
      }),
    );
  }

  log.d({ user });
  if (user.statusCode === status.NEED_EMAIL_VALIDATION) {
    log.w("Compte non validé");
    return next(
      new AppError("Compte non validé", {
        name: ERRORS_LOGIN.NeedEmailValidation,
        statusCode: 400,
      }),
    );
  }

  try {
    const accessToken = signAccessToken({ ...user, id: Number(user.id) });
    const refreshToken = signRefreshToken({ ...user, id: Number(user.id) });

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
