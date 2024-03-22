const FormData = require("form-data");
const fs = require("fs");

const config = require("../config");
const AppError = require("../utils/error");
const logger = require("../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  log.i("IN");
  const file = req.file;

  const formData = new FormData();
  formData.append("FILES", fs.createReadStream(file.path), file.originalname);

  try {
    const response = await fetch(config.antivirusUrl, {
      body: formData,
      headers: formData.getHeaders(),
      method: "POST",
    });

    log.d({ response });

    if (response.ok) {
      log.w("DONE - Service unavailable");
      return next();
    }

    log.d({ data: response.data });

    if (response.data.success) {
      log.i("DONE");
      return next();
    }

    log.w(
      "DONE - Scan returns threat on file " + file.filename,
      ...response.data.data.result[0].viruses,
    );
    return next(
      new AppError("Scan returns threat on file " + file.filename, {
        name: "file.scan-antivirus",
      }),
    );
  } catch (error) {
    log.w("DONE - Service unavailable", error);
    return next();
  }
};
