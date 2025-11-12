const jwt = require("jsonwebtoken");
const config = require("../../../config");
const AppError = require("../../../utils/error");
const logger = require("../../../utils/logger")(module.filename);

const MailUtils = require("../../../utils/mail");
const {
  mailService: { send: Send },
} = require("../../../services/mail");

const UserService = require("../../../services/User");
const OrganismeService = require("../../../services/Organisme");
const TerritoireService = require("../../../services/Territoire");
const FoUserService = require("../../../services/FoUser");
const { status } = require("../../../helpers/users");

module.exports = async (req, res, next) => {
  const { token } = req.body;
  logger.i("IN", { token });

  if (!token)
    return next(new AppError("Paramètre incorrect", { statusCode: 400 }));

  const email = await verifyToken(token, next);
  if (!email) return;

  const user = await activateUser(email, next);
  if (!user) return;

  try {
    if (user.statusCode === status.NEED_SIRET_VALIDATION) {
      await handleSiretValidation(user);
      return res.status(200).json({ status: status.NEED_SIRET_VALIDATION });
    }

    // Legacy accounts without SIRET
    await Send(MailUtils.usagers.authentication.sendAccountValided(email));
    return res.status(200).json({ user });
  } catch (error) {
    logger.w(error);
    return next(
      new AppError("Erreur lors du traitement", {
        cause: error,
        statusCode: 500,
      }),
    );
  }
};

async function verifyToken(token, next) {
  try {
    const { email } = await jwt.verify(token, config.tokenSecret, {
      algorithm: config.algorithm,
    });
    return email;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Token expiré", {
          name: "TokenExpiredError",
          statusCode: 401,
        }),
      );
    }
    return next(err);
  }
}

async function activateUser(email, next) {
  try {
    const user = await UserService.activate(email);
    if (!user) {
      return next(
        new AppError("Token invalide", {
          name: "InvalidToken",
          statusCode: 401,
        }),
      );
    }
    return user;
  } catch (err) {
    return next(err);
  }
}

async function handleSiretValidation(user) {
  let mailUserOrganisme = [];
  let organisme = await OrganismeService.getBySiret(user.userSiret);

  if (organisme && organisme?.organismeId) {
    mailUserOrganisme =
      (await FoUserService.getMailUserOrganismeId(organisme.organismeId)) || [];
  }

  if (!organisme || mailUserOrganisme.length === 0) {
    const siren = user.userSiret.substring(0, 9);
    organisme = await OrganismeService.getSiege(siren);
    if (organisme && organisme?.organismeId) {
      mailUserOrganisme = await FoUserService.getMailUserOrganismeId(
        organisme.organismeId,
      );
    }
  }

  if (!organisme || mailUserOrganisme.length === 0) {
    const territoire = await TerritoireService.readFicheIdByTerCode(
      user.userTerritoire,
    );
    const fiche = await TerritoireService.readOne(territoire.id);
    await Promise.all([
      Send(
        MailUtils.usagers.newVaoAccount.sendWaitAccountValidationDREETS(
          user.email,
          fiche.service_mail,
        ),
      ),
      Send(
        MailUtils.bo.newVaoAccount.sendDretsNewAccountValidation({
          email: fiche.service_mail,
          user,
        }),
      ),
    ]);
  } else {
    await Promise.all([
      Send(
        MailUtils.usagers.newVaoAccount.sendWaitAccountValidationOrganisme(
          user.email,
        ),
      ),
      ...mailUserOrganisme.map(({ mail }) =>
        Send(
          MailUtils.usagers.newVaoAccount.sendOrganismeNewAccountValidation({
            email: mail,
            user,
          }),
        ),
      ),
    ]);
  }
}
