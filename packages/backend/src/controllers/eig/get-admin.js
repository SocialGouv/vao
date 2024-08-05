const logger = require("../../utils/logger");
const eigService = require("../../services/eig");

const log = logger(module.filename);

module.exports = async function getAdmin(req, res, next) {
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
    const eig = await eigService.getAdmin(params);
    return res.status(200).json({ eig });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
