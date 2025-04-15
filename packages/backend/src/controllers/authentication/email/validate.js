const jwt = require("jsonwebtoken");
const config = require("../../../config");
const User = require("../../../services/User");
const { status } = require("../../../helpers/users");

const AppError = require("../../../utils/error");
const MailUtils = require("../../../utils/mail");
const Send = require("../../../services/mail").mailService.send;
const insee = require("../../../services/Insee");
const {
  getFichesTerritoireForRegionByInseeCode,
} = require("../../../services/Territoire");

const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { token: validationToken } = req.body;
  log.i("IN", { validationToken });
  if (!validationToken) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let email = null;
  try {
    const result = await jwt.verify(validationToken, config.tokenSecret, {
      algorithm: "ES512",
    });
    email = result.email;
  } catch (error) {
    log.w("DONE with error");
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Token expiré", {
          name: "TokenExpiredError",
          statusCode: 401,
        }),
      );
    }
    return next(error);
  }

  if (!email) {
    return next(
      new AppError("Token invalide", {
        name: "InvalidToken",
        statusCode: 401,
      }),
    );
  }

  let user = null;
  try {
    user = await User.activate(email);
  } catch (error) {
    return next(error);
  }
  if (!user) {
    return next(
      new AppError("Token invalide", {
        name: "InvalidToken",
        statusCode: 401,
      }),
    );
  }
  if (user.statusCode === status.NEED_SIRET_VALIDATION) {
    try {
      const etablissement = await insee.getEtablissement(user.userSiret);
      const codePostal =
        etablissement.adresseEtablissement.codePostalEtablissement;
      const fiche = await getFichesTerritoireForRegionByInseeCode(codePostal);
      // check if mail is empty
      log.w(codePostal);
      log.w(fiche);
      if (!fiche?.serviceMail) {
        return res.status(200).json({ status: status.NEED_SIRET_VALIDATION });
      }
      await Send(
        MailUtils.bo.newVaoAccount.sendDretsNewAccountValidation({
          email: fiche.serviceMail,
          user,
        }),
      );
      return res.status(200).json({ status: status.NEED_SIRET_VALIDATION });
    } catch (error) {
      log.w(error);
      return next(
        new AppError("Erreur lors de la récupération de l'établissement", {
          cause: error,
          name: "InseeError",
          statusCode: 500,
        }),
      );
    }
  }
  try {
    // if user has no siret, legacy way to create account
    await Send(MailUtils.usagers.authentication.sendAccountValided(email));
  } catch (error) {
    return next(
      new AppError("Erreur lors de l'envoi du mail", {
        cause: error,
        name: "MailError",
        statusCode: 500,
      }),
    );
  }
  return res.status(200).json({ user });
};
