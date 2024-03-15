const express = require("express");
const multer = require("multer");
const config = require("../config");
const checkJWT = require("../middlewares/checkJWT");

const router = express.Router();

const { documentsController } = require("../controllers");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.tmpDirectory);
  },
});
const upload = multer({
  storage,
});

const uploadSingle = upload.single("file");

function uploadFile(req, res, next) {
  // eslint-disable-next-line consistent-return
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("uploadSingle", err);
      return res.status(400).send({ message: "Erreur inattendue." });
    }
    next();
  });
}

router.get("/:uuid", checkJWT, documentsController.download);
router.post("/", checkJWT, uploadFile, documentsController.upload);

module.exports = router;
