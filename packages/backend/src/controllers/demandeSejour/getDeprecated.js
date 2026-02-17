const yup = require("yup");
const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error").default;

const logger = require("../../utils/logger");

const log = logger(module.filename);

const querySchema = yup.object({
  sortBy: yup
    .string()
    .oneOf([
      "declarationId",
      "statut",
      "idFonctionnelle",
      "departementSuivi",
      "organismeId",
      "libelle",
      "periode",
      "dateDebut",
      "dateFin",
      "createdAt",
      "editedAt",
      "duree",
      "vacanciers",
      "personnel",
      "transport",
      "messageOrdreEtat",
      "messageCreatedAt",
      "messageReadAt",
      "messageLastAt",
    ])
    .nullable(),
});

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  let params;
  try {
    params = await querySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    log.w("Query validation failed", {
      error: error.message,
      query: req.query,
    });
    return next(new AppError("Paramètre incorrect", { statusCode: 400 }));
  }

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    let organismesId;
    if (organisme.personneMorale?.porteurAgrement) {
      const organismes = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      organismesId = organismes.map((o) => o.organismeId);
    } else {
      organismesId = [organisme.organismeId];
    }
    const demandes = await DemandeSejour.getDeprecated(params, organismesId);
    log.d(demandes);
    return res.status(200).json({ demandes });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
