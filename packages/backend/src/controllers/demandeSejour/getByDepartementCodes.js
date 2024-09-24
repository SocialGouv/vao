const yup = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function getByDepartementCodes(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId } = decoded ?? {};
  const territoireCode = req.decoded.territoireCode;
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;
    const params = {
      limit,
      offset,
      search: JSON.parse(search ?? "{}"),
      sortBy,
      sortDirection,
    };

    try {
      await yup
        .object({
          limit: yup.number().nullable(),
          offset: yup.number().nullable(),
          search: yup.object().json().nullable(),
          sortBy: yup
            .string()
            .oneOf([
              "libelle",
              "statut",
              "typeOrganisme",
              "personneMorale",
              "personnePhysique",
              "demandeSejourId",
              "declarationId",
              "dateDebut",
              "dateFin",
              "organismeId",
              "organisme",
              "idFonctionnelle",
              "messageOrdreEtat",
            ])
            .nullable(),
          sortDirection: yup.string().oneOf(["ASC", "DESC"]).nullable(),
        })
        .validate(params, {
          abortEarly: false,
          stripUnknown: true,
        });
    } catch (error) {
      return next(new ValidationAppError(error));
    }
    const demandesWithPagination = await DemandeSejour.getByDepartementCodes(
      params,
      territoireCode,
      req.departements.map((d) => d.value),
    );
    log.d(demandesWithPagination);
    return res.status(200).json({ demandesWithPagination });
  } catch (error) {
    return next(error);
  }
};
