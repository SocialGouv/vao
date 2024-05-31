const DocumentService = require("../../services/Document");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  try {
    const { name } = req.params;
    log.i("IN", { name });
    const file = await DocumentService.getStatic(name);
    res.download(file);
    log.i("DONE");
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
