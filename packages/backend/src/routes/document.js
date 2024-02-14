const express = require("express");
const multer = require("multer");
const config = require("../config");
const checkJWT = require("../middlewares/checkJWT");

const router = express.Router();

const { documentController } = require("../controllers");

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
      // An unknown error occurred when uploading.
      return res.status(400).send({ message: "Erreur inattendue." });
    }

    // Everything went fine.
    next();
  });
}

router.get("/:uuid", checkJWT, documentController.downloadAgrement);
router.post("/agrement", checkJWT, uploadFile, documentController.agrementPost);

module.exports = router;
