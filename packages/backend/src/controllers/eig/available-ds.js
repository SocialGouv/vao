const logger = require("../../utils/logger");
const eigService = require("../../services/eig");

const log = logger(module.filename);

module.exports = async function getAvailableDs(req, res, next) {
  log.i("IN");

  const { search } = req.query;

  if (!search || search === "") {
    return res.status(200).json([]);
  }

  try {
    const ds = await eigService.getAvailableDs(search);
    return res.status(200).json(ds);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  } finally {
    log.i("OUT");
  }
};
