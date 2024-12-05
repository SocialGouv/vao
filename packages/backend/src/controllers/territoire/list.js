const yup = require("yup");

const Territoire = require("../../services/Territoire");
const logger = require("../../utils/logger");

const log = logger(module.filename);
const ValidationAppError = require("../../utils/validation-error");

module.exports = async function list(req, res, next) {
  log.i("IN");
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
        sortBy: yup.string().oneOf(["text"]).nullable(),
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
    const territoiresWithPagination = await Territoire.fetch(params);
    log.i("DONE");
    return res.json({ territoiresWithPagination });
  } catch (error) {
    return next(error);
  }
};
