const express = require("express");

const router = express.Router();
const { referentielController } = require("../controllers");

router.get("/dispositifs", referentielController.getDispositifs);

module.exports = router;
