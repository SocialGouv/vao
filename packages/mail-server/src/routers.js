const express = require("express");

const logger = require("./utils/logger");

const { mailService } = require("./mail.service");

const log = logger(module.filename);

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    log.i("POST / - IN", { body });
    const response = await mailService.send(body);
    log.i("POST / - DONE", { response });
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  mail: router,
};
