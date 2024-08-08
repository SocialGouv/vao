const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const stats = await DemandeSejour.getStats(userId);
    console.log(stats);
    return res.status(200).json({ stats });
  } catch (error) {
    console.log(error);
    log.w("DONE with error");
    return next(error);
  }
};
