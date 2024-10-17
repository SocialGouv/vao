const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const FOUserController = require("../controllers/fo-user");

// Renvoie la liste des utilisateurs du BO
router.get("/", BOcheckJWT, FOUserController.list);
router.get("/extract/:organismeId", BOcheckJWT, FOUserController.getExtract);

module.exports = router;
