const express = require("express");
const checkJWT = require("../middlewares/checkJWT");

const router = express.Router();

const checkPermissionAgrement = require("../middlewares/checkPermissionAgrement");
const { agrementController } = require("../controllers");

router.post("/", checkJWT, checkPermissionAgrement, agrementController.post);

module.exports = router;
