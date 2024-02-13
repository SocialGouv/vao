const jwt = require("jsonwebtoken");
const config = require("../config");

const User = require("../services/User");
const AppError = require("../utils/error");
// const Session = require("../services/Session");

const logger = require("../utils/logger");
const { buildAccessToken, buildRefreshToken } = require("../utils/token");

const log = logger(module.filename);

async function checkJWT(req, res, next) {
  const { cookies } = req;
  log.i("IN");
  try {
    if (!cookies) {
      log.i("DONE - Aucun cookie présent");
      throw new AppError("Utilisateur non identifié", { name: "UnsignedUser" });
    }

    const accessToken = cookies.PP_access_token;
    const refreshToken = cookies.PP_refresh_token;

    if (!accessToken && !refreshToken) {
      log.i("DONE - Aucun token présent");
      throw new AppError("Utilisateur non identifié", { name: "UnsignedUser" });
    }

    if (accessToken) {
      try {
        const decoded = await jwt.verify(
          accessToken,
          `${config.accessToken.secret}`,
        );
        log.i("DONE - access_token decoded");
        req.decoded = decoded;
        return next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          log.d("accessToken expired");
          res.clearCookie("PP_access_token", {
            httpOnly: true,
            secure: true,
          });
        } else {
          log.w("Unknown error", error);
          throw new Error(error);
        }
      }
    }

    if (!refreshToken) {
      log.d("access_token & refresh_otken renewed");
      throw new AppError("Utilisateur non identifié", { name: "UnsignedUser" });
    }

    const rtDecoded = await jwt.verify(
      refreshToken,
      `${config.refreshToken.secret}`,
    );

    log.d({ rtDecoded });

    const users = await User.read({ id: rtDecoded.userId });
    if (!users.length === 0) {
      log.w("Utilisateur non trouvé");
      throw new AppError("Utilisateur non trouvé", { name: "UserNotFound" });
    }
    const [user] = users;
    const newAccessToken = jwt.sign(
      buildAccessToken(user),
      config.accessToken.secret,
      {
        expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
      },
    );

    const newRefreshToken = jwt.sign(
      buildRefreshToken(user),
      config.refreshToken.secret,
      {
        expiresIn: config.refreshToken.expiresIn / 1000,
      },
    );
    //   TODO; gérer session
    //   await Session.create(user.id, newRefreshToken);

    res.cookie("PP_access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: config.accessToken.expiresIn,
    });

    res.cookie("PP_refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: config.refreshToken.expiresIn,
    });

    req.decoded = buildAccessToken(user);

    log.d("access_token & refresh_otken renewed");

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      log.i("DONE - refreshToken expired");
      res.clearCookie("PP_refresh_token", {
        httpOnly: true,
        secure: true,
      });
      return res.status(400).json({ code: "TokenExpiredError" });
    }
    if (error instanceof AppError) {
      log.i("DONE with error", error);
      return res.status(400).json({ code: error.name });
    }
    log.i("DONE with unexpected error", error);
    return res.status(400).json({
      message: "Une erreur est suvenue lors de la vérification des token",
    });
  }
}

module.exports = checkJWT;
