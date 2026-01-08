const express = require("express");
const checkJWT = require("../middlewares/checkJWT");
const checkPermissionAgrement = require("../middlewares/checkPermissionAgrement");

const router = express.Router();

const { agrementController } = require("../controllers");

router.post("/", checkJWT(), checkPermissionAgrement, agrementController.post);

module.exports = router;
