const logger = require("../../utils/logger");
const eigService = require("../../services/eig");

const log = logger(module.filename);

module.exports = async function getTotalToRead(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });
  try {
    const totalToRead = await eigService.getTotalToRead(userId);
    return res.status(200).json({ totalToRead });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
