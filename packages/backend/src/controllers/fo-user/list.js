const FoUser = require("../../services/FoUser");
const { object, number, string } = require("yup");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function list(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  let params;
  try {
    const search = req.query.search ? JSON.parse(req.query.search) : {};
    log.d({ search });
    params = await object({
      limit: number().nullable(),
      offset: number().nullable(),
      search: object().json().nullable(),
      sortBy: string()
        .oneOf([
          "nom",
          "prenom",
          "email",
          "statut",
          "dateCreation",
          "organismeId",
          "typeOrganisme",
          "siren",
          "siret",
          "raisonSociale",
          "nombreDeclarations",
        ])
        .nullable(),
      sortDirection: string().oneOf(["ASC", "DESC"]).nullable(),
    }).validate(
      { ...req.query, search },
      {
        abortEarly: false,
      },
    );
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    log.d(params);
    const result = await FoUser.read(params);
    log.d(result);
    return res.status(200).json(result);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
