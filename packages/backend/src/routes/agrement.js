const express = require("express");
const checkJWT = require("../middlewares/checkJWT");

const router = express.Router();

const { agrementController } = require("../controllers");

router.post("/", checkJWT, agrementController.post);

module.exports = router;
