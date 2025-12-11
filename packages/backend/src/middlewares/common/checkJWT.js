const jwt = require("jsonwebtoken");
const config = require("../../config");

const UserBo = require("../../services/BoUser");
const UserFo = require("../../services/FoUser");
const Session = require("../../services/common/Session");
const { schema } = require("../../helpers/schema");

const AppError = require("../../utils/error").default;
const logger = require("../../utils/logger");
const {
  buildAccessToken: buildAccessTokenBo,
  buildRefreshToken: buildRefreshTokenBo,
} = require("../../utils/bo-token");
const {
  buildAccessToken: buildAccessTokenFo,
  buildRefreshToken: buildRefreshTokenFo,
} = require("../../utils/token");

const log = logger(module.filename);
const clearCookieOptions = { httpOnly: true, sameSite: "strict", secure: true };
const cookieOptions = {
  ...clearCookieOptions,
  maxAge: config.accessToken.expiresIn,
};

function getCookieNames(targetSchema) {
  const prefix = targetSchema === schema.BACK ? "VAO_BO" : "VAO";
  return {
    accessTokenName: `${prefix}_access_token`,
    refreshTokenName: `${prefix}_refresh_token`,
  };
}

function getTokenBuilders(targetSchema) {
  return targetSchema === schema.BACK
    ? {
        buildAccessToken: buildAccessTokenBo,
        buildRefreshToken: buildRefreshTokenBo,
      }
    : {
        buildAccessToken: buildAccessTokenFo,
        buildRefreshToken: buildRefreshTokenFo,
      };
}

async function verifyToken(token, tokenSecret) {
  return jwt.verify(token, tokenSecret, { algorithm: config.algorithm });
}

async function handleSessionCheck(refreshToken, targetSchema) {
  const session = await Session.read(targetSchema, {
    refresh_token: refreshToken,
  });
  if (!session.length) {
    throw new AppError("Token révoqué ou réutilisé", {
      name: "TokenRevoked",
      statusCode: 409,
    });
  }
}

async function getUserBySchema(targetSchema, userId) {
  if (targetSchema === schema.BACK) {
    return {
      ...(await UserBo.readOne(userId)),
      id: userId,
    };
  }

  if (targetSchema === schema.FRONT) {
    return {
      ...(await UserFo.readOne(userId)),
      id: userId,
    };
  }

  throw new AppError("targetSchema is not valid", {
    name: "InvalidTargetSchema",
    statusCode: 400,
  });
}

async function checkJWT(req, res, next, targetSchema) {
  log.i("IN");

  if (![schema.FRONT, schema.BACK].includes(targetSchema)) {
    return next(
      new AppError("targetSchema is not valid", {
        name: "InvalidTargetSchema",
        statusCode: 400,
      }),
    );
  }

  const { cookies } = req;
  if (!cookies) {
    return next(
      new AppError("Utilisateur non identifié", {
        name: "UnsignedUser",
        statusCode: 401,
      }),
    );
  }
  const tokenSecret =
    targetSchema === schema.BACK
      ? config.tokenSecret_BO
      : config.tokenSecret_FO;
  const accessToken =
    targetSchema === schema.BACK
      ? cookies.VAO_BO_access_token
      : cookies.VAO_access_token;
  const refreshToken =
    targetSchema === schema.BACK
      ? cookies.VAO_BO_refresh_token
      : cookies.VAO_refresh_token;

  const { accessTokenName, refreshTokenName } = getCookieNames(targetSchema);

  try {
    await handleSessionCheck(refreshToken, targetSchema);
    if (accessToken) {
      try {
        const decoded = await verifyToken(accessToken, tokenSecret);
        req.decoded = decoded;
        return next();
      } catch (error) {
        if (!(error instanceof jwt.TokenExpiredError)) {
          res.clearCookie(accessTokenName, clearCookieOptions);
          return next(
            new AppError("Token invalide", {
              cause: error,
              name: "InvalidToken",
              statusCode: 401,
            }),
          );
        }
        log.d("accessToken expired");
      }
    }

    if (!refreshToken) {
      return next(
        new AppError("Utilisateur non identifié", {
          name: "UnsignedUser",
          statusCode: 401,
        }),
      );
    }

    await handleSessionCheck(refreshToken, targetSchema);

    let rtDecoded;
    try {
      rtDecoded = await verifyToken(refreshToken, tokenSecret);
    } catch (error) {
      res.clearCookie(refreshTokenName, clearCookieOptions);
      const name =
        error instanceof jwt.TokenExpiredError
          ? "TokenExpiredError"
          : "InvalidToken";
      return next(
        new AppError(error.message, {
          cause: error,
          name,
          statusCode: 401,
        }),
      );
    }

    const user = await getUserBySchema(targetSchema, rtDecoded.userId);
    const { buildAccessToken, buildRefreshToken } =
      getTokenBuilders(targetSchema);
    const newAccessTokenPayload = buildAccessToken(user);
    const newRefreshTokenPayload = buildRefreshToken(user);

    const newAccessToken = jwt.sign(newAccessTokenPayload, tokenSecret, {
      algorithm: config.algorithm,
      expiresIn: config.accessToken.expiresIn / 1000,
    });

    const newRefreshToken = jwt.sign(newRefreshTokenPayload, tokenSecret, {
      algorithm: config.algorithm,
      expiresIn: config.refreshToken.expiresIn / 1000,
    });

    const rotated = await Session.rotate(
      user.id,
      refreshToken,
      newRefreshToken,
      targetSchema,
      {
        caller: req.originalUrl,
      },
    );

    if (!rotated) {
      return next(
        new AppError("Erreur durant la rotation de session", {
          name: "SessionRotation",
          statusCode: 409,
        }),
      );
    }

    res.cookie(accessTokenName, newAccessToken, { cookieOptions });
    res.cookie(refreshTokenName, newRefreshToken, { cookieOptions });

    req.decoded = newAccessTokenPayload;
    log.i("DONE", "access_token & refresh_token renewed");

    return next(
      new AppError("token has been rotated", {
        name: "SessionRotation",
        statusCode: 409,
      }),
    );
  } catch (err) {
    log.w("Erreur dans checkJWT", err);
    return next(err);
  }
}

module.exports = checkJWT;
