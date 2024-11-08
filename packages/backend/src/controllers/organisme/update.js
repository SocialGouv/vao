const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function update(req, res, next) {
  log.i("IN", req.body);
  const { body } = req;
  const organismeId = req.params.organismeId;
  const { type, parametre } = body;

  if (!type || !parametre || !organismeId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  if (parametre.siret) {
    try {
      const [organismeWithTheSiret, isComplet, currentSiret] =
        await Promise.all([
          Organisme.getBySiret(parametre.siret),
          Organisme.getIsComplet(organismeId),
          Organisme.getSiret(organismeId),
        ]);

      if (isComplet && currentSiret !== parametre.siret) {
        log.w(
          "DONE with error : Le siret ne peux pas etre modifié car l'organisme est complet",
        );
        throw new AppError(
          "Le siret ne peux pas etre modifié car l'organisme est complet",
          {
            statusCode: 403,
            name: "Forbidden - siret update - organisme complete",
          },
        );
      }

      if (
        !isComplet &&
        organismeWithTheSiret &&
        organismeWithTheSiret.organismeId.toString() !== organismeId.toString()
      ) {
        log.w(
          "DONE with error : Le siret ne peux pas etre modifé car il existe déjà en base",
        );
        throw new AppError(
          "Le siret ne peux pas etre modifé car il existe déjà en base",
          {
            statusCode: 403,
            name: "Forbidden - siret update - organisme incomplete",
          },
        );
      }
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  }

  try {
    await Organisme.update(type, parametre, organismeId);
    return res.status(200).json({
      message: "sauvegarde organisme OK",
      organismeId,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
