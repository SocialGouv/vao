const FormData = require("form-data");
const axios = require("axios");

const { createReadStream } = require("node:fs");

const config = require("../config");
const AppError = require("../utils/error");
const logger = require("../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { path, originalname } = req.file;
  log.i("IN", { originalname, path });

  try {
    const form = new FormData();

    form.append("FILES", createReadStream(path));

    const formHeaders = form.getHeaders();

    const response = await axios.post(config.antivirusUrl, form, {
      headers: { ...formHeaders },
    });

    const data = await response.data;

    log.d(JSON.stringify(data));

    if (!data.success) {
      log.w("DONE - Service unavailable");
      return next();
    }

    if (data.data.result[0].viruses.length) {
      log.w(
        "DONE - Scan returns threat on file " + originalname,
        ...data.data.result[0].viruses,
      );
      return next(
        new AppError("Scan returns threat on file " + originalname, {
          name: "file.scan-antivirus",
        }),
      );
    }

    log.i("DONE");
    return next();
  } catch (error) {
    log.w("DONE - Service unavailable", error);
    return next();
  }
};
