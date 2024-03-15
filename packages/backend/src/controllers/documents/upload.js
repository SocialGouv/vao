const DocumentService = require("../../services/Document");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res) => {
  log.i("In");
  const { category } = req.body;
  const file = req.file;
  if (!category || !file) {
    log.w("missing parameter");
    return res.status(400).json({ msg: "paramètre d'appels incorrects" });
  }

  try {
    const uuid = await DocumentService.upload(category, file);
    log.d("Add document - DONE", uuid);
    return res.json({ uuid });
  } catch (err) {
    log.w(err);
    return res.status(500).json({ code: "DefaultError" });
  }
};
