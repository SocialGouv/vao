const express = require("express");
const multer = require("multer");
const config = require("../config");
const checkJWT = require("../middlewares/checkJWT");

const router = express.Router();

const { documentController } = require("../controllers");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.TMP_DIRECTORY);
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
      // An unknown error occurred when uploading.
      return res.status(400).send({ message: "Erreur inattendue." });
    }

    // Everything went fine.
    next();
  });
}

router.post("/", checkJWT, uploadFile, documentController.post);

module.exports = router;
