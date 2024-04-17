const BoUser = require("../../services/BoUser");
// const Session = require("../../services/Session");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function list(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;
    log.d({ search });
    const result = await BoUser.read({
      limit,
      offset,
      search: JSON.parse(search ?? "{}"),
      sortBy,
      sortDirection,
    });
    log.d(result);
    return res.status(200).json(result);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
