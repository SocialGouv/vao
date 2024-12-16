const fs = require("node:fs/promises");
const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  log.i("IN");
  const { category } = req.body;
  const { decoded } = req;
  const file = req.file;
  if (!category || !file) {
    log.w("DONE with error");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  if (category === "agrement" && file.mimetype !== "application/pdf") {
    log.w("DONE with error");
    return next(
      new AppError("Format d'agrément incorrect.", {
        statusCode: 415,
      }),
    );
  } else if (
    !(
      file.mimetype == "application/pdf" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpeg"
    )
  ) {
    log.w("DONE with error filetype : ", file.mimetype);
    return next(
      new AppError("Format de fichier non supporté.", {
        statusCode: 415,
      }),
    );
  }

  try {
    const { path, originalname: filename, mimetype } = file;
    const data = await fs.readFile(path);
    const uuid = await DocumentService.createFile(
      filename,
      category,
      mimetype,
      data,
      decoded.id,
    );
    log.d("DONE", uuid);
    return res.json({ uuid });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
