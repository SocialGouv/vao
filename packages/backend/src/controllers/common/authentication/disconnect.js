const logger = require("../../../utils/logger");
const Session = require("../../../services/common/Session");
const config = require("../../../config");
const jwt = require("jsonwebtoken");
const { schema } = require("../../../helpers/schema");

const log = logger(module.filename);

module.exports = async function disconnect(req, res, targetSchema) {
  log.i("IN");
  if (
    !targetSchema ||
    !Object.values([schema.FRONT, schema.BACK]).includes(targetSchema)
  ) {
    log.w("Schema non reconnu pour la déconnexion", { targetSchema });
    return res.status(400).json({
      message: "Schema non reconnu pour la déconnexion.",
      name: "UnknownSchema",
    });
  }
  const refreshToken =
    targetSchema === schema.FRONT
      ? req.cookies.VAO_refresh_token
      : req.cookies.VAO_BO_refresh_token;
  let rtDecoded;
  if (!refreshToken) {
    log.w("refresh_token manquant dans les cookies");
    return res.status(400).json({
      message:
        "Le refresh_token est manquant, impossible de déconnecter la session.",
      name: "MissingRefreshToken",
    });
  }
  try {
    rtDecoded = await jwt.verify(refreshToken, config.tokenSecret, {
      algorithm: "ES512",
    });

    await Session.clean({ id: rtDecoded.userId }, targetSchema);
    log.i("DONE - refresh_token decoded");
  } catch (error) {
    log.w("Impossible de décoder le refresh_token", error);
    return res.status(401).json({
      message: "Le refresh_token est invalide ou a expiré.",
      name: "InvalidRefreshToken",
    });
  } finally {
    const clearCookieOptions = {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    };
    if (targetSchema === schema.FRONT) {
      res.clearCookie("VAO_access_token", clearCookieOptions);
      res.clearCookie("VAO_refresh_token", clearCookieOptions);
    } else {
      res.clearCookie("VAO_BO_access_token", clearCookieOptions);
      res.clearCookie("VAO_BO_refresh_token", clearCookieOptions);
    }
    log.i("Cookies cleared");
  }
  log.i("DONE");
  return res.json({ message: "Déconnexion" });
};
