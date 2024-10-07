const express = require("express");
const Healthz = require("../services/Healthz");

const router = express.Router();

router.get("/", async function mainHandler(req, res, next) {
  try {
    await Healthz.healthz();
  } catch (err) {
    next(err);
  }
  return res.status(200).json({ status: "ok" });
});

module.exports = router;
