const express = require("express");

const router = express.Router();

const boCheckJWT = require("../middlewares/bo-check-JWT");

const metabaseController = require("../controllers/metabase");

router.get("/board/:boardId", boCheckJWT, metabaseController.getMetabaseIframe);

module.exports = router;
