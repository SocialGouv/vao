const jwt = require("jsonwebtoken");
const config = require("../config");

const User = require("../services/User");
const Session = require("../services/Session");

const AppError = require("../utils/error");
const logger = require("../utils/logger");
const { buildAccessToken, buildRefreshToken } = require("../utils/token");

const log = logger(module.filename);

async function checkJWT(req, res, next) {
  const { cookies } = req;
  log.i("IN");
  try {
    if (!cookies) {
      log.i("DONE - Aucun cookie présent");
      throw new AppError("Utilisateur non identifié", {
        name: "UnsignedUser",
        statusCode: 401,
      });
    }

    const accessToken = cookies.VAO_access_token;
    const refreshToken = cookies.VAO_refresh_token;

    if (accessToken) {
      log.d("accessToken found");
      try {
        const decoded = await jwt.verify(accessToken, config.tokenSecret, {
          algorithm: "ES512",
        });
        log.i("DONE - access_token decoded");
        Object.assign(req, { decoded });
        return next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          log.d("accessToken expired");
        } else {
          log.w("Unknown error", error);
          res.clearCookie("VAO_accessToken", {
            httpOnly: true,
            secure: true,
          });
          return next(
            new AppError("Token invalide", {
              cause: error,
              name: "InvalidToken",
              statusCode: 401,
            }),
          );
        }
      }
    }

    if (!refreshToken) {
      log.d("refresh_token missing");
      return next(
        new AppError("Utilisateur non identifié", {
          name: "UnsignedUser",
          statusCode: 401,
        }),
      );
    }

    const session = await Session.read({ refresh_token: refreshToken });
    if (session.length === 0) {
      log.d("token reuse");
      return next(
        new AppError("réutilisation de token expiré", {
          name: "TokenReuse",
          statusCode: 409,
        }),
      );
    }

    let rtDecoded;
    try {
      rtDecoded = await jwt.verify(refreshToken, config.tokenSecret, {
        algorithm: "ES512",
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        log.i("refresh_token expired");
        return next(
          new AppError(error.message, {
            cause: error,
            name: "TokenExpiredError",
            statusCode: 401,
          }),
        );
      }
      res.clearCookie("VAO_refreshToken", {
        httpOnly: true,
        secure: true,
      });
      return next(
        new AppError("Token invalide", {
          cause: error,
          name: "InvalidToken",
          statusCode: 401,
        }),
      );
    }

    const users = await User.read({ id: rtDecoded.userId });
    if (users.length === 0) {
      log.w("Utilisateur non trouvé");
      return next(
        new AppError("Utilisateur non trouvé", {
          name: "UserNotFound",
          statusCode: 401,
        }),
      );
    }
    const [user] = users;

    const newAccessToken = jwt.sign(
      buildAccessToken(user),
      config.tokenSecret,
      {
        algorithm: "ES512",
        expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
      },
    );

    const newRefreshToken = jwt.sign(
      buildRefreshToken(user),
      config.tokenSecret,
      {
        algorithm: "ES512",
        expiresIn: config.refreshToken.expiresIn / 1000,
      },
    );

    const objectError = { caller: req.originalUrl };
    const newSession = await Session.rotate(
      user.id,
      refreshToken,
      newRefreshToken,
      objectError,
    );

    if (!newSession) {
      log.w("erreur sur la création de session");
      return next(
        new AppError("erreur durant la rotation de session", {
          name: "SessionRotation",
          statusCode: 409,
        }),
      );
    }

    res.cookie("VAO_access_token", newAccessToken, {
      httpOnly: true,
      maxAge: `${config.accessToken.expiresIn}`,
      sameSite: "strict",
      secure: true,
    });

    res.cookie("VAO_refresh_token", newRefreshToken, {
      httpOnly: true,
      maxAge: `${config.refreshToken.expiresIn}`,
      sameSite: "strict",
      secure: true,
    });

    Object.assign(req, { decoded: buildAccessToken(user) });

    log.i("DONE", "access_token & refresh_token renewed");
    return next(
      new AppError("token has been rotated", {
        name: "SessionRotation",
        statusCode: 409,
      }),
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = checkJWT;
