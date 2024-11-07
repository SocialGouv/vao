const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const checkJWT = require("../middlewares/checkJWT");
const FOUserController = require("../controllers/fo-user");

// Renvoie la liste des utilisateurs du BO
router.get("/admin/list", BOcheckJWT, FOUserController.list);
router.get("/admin/extract/", BOcheckJWT, FOUserController.getExtract);
router.get("/list", checkJWT, FOUserController.list);

module.exports = router;
