const logger = require("../../utils/logger");
const eigService = require("../../services/eig");
const yup = require("yup");
const ValidationAppError = require("../../utils/validation-error").default;

const log = logger(module.filename);

module.exports = async function getMe(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

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
            "id",
            "dateDebut",
            "dateFin",
            "idFonctionnelle",
            "createdAt",
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
  try {
    const eig = await eigService.getByUserId(userId, params);
    return res.status(200).json({ eig });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
