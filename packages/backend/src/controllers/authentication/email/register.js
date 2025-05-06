const jwt = require("jsonwebtoken");

const User = require("../../../services/User");
const Send = require("../../../services/mail").mailService.send;

const config = require("../../../config");
const registerSchema = require("../../../schemas/register");

const logger = require("../../../utils/logger");
const MailUtils = require("../../../utils/mail");
const { buildEmailToken } = require("../../../utils/token");
const ValidationAppError = require("../../../utils/validation-error");
const AppError = require("../../../utils/error");
const {
  getFichesTerritoireForRegionByInseeCode,
} = require("../../../services/Territoire");
const insee = require("../../../services/Insee");

const log = logger(module.filename);

module.exports = async function register(req, res, next) {
  log.i("IN");
  const { email, password, nom, prenom, siret, telephone } = req.body;

  const part = { email, nom, password, prenom, siret, telephone };
  try {
    await registerSchema().validate(part, {
      abortEarly: false,
    });
  } catch (error) {
    return next(new ValidationAppError(error));
  }
  let territoire = "";
  try {
    const etablissement = await insee.getEtablissement(siret);
    const codePostal =
      etablissement.adresseEtablissement.codePostalEtablissement;
    territoire = await getFichesTerritoireForRegionByInseeCode(codePostal);
    log.w(codePostal);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
  try {
    const { user, code } = await User.registerByEmail({
      email,
      nom,
      password,
      prenom,
      siret,
      telephone,
      terCode: territoire.terCode,
    });

    log.d({ user });
    const token = jwt.sign(buildEmailToken(email), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.validationToken.expiresIn / 1000,
    });
    try {
      await Send(
        MailUtils.usagers.authentication.sendValidationMail({
          email,
          token,
        }),
      );
    } catch (error) {
      log.w(error.name, error.message);

      return next(
        new AppError("Erreur lors de l'envoi du mail", {
          cause: error,
          name: "MailError",
          statusCode: 500,
        }),
      );
    }
    log.i("DONE");
    return res.status(200).json({ code });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
