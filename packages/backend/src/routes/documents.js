const express = require("express");
const multer = require("multer");
const config = require("../config");
const checkJWT = require("../middlewares/checkJWT");
const scanFile = require("../middlewares/scan-file");
const checkPermissionBoToDownload = require("../middlewares/checkPermissionBoToDownload");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const logger = require("../utils/logger");

const log = logger(module.filename);
const router = express.Router();

const { documentsController } = require("../controllers");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.tmpDirectory);
  },
});
const upload = multer({
  limits: {
    fileSize: 5000000,
  },
  storage,
});

const uploadSingle = upload.single("file");

function uploadFile(req, res, next) {
  // eslint-disable-next-line consistent-return
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        log.w("uploadSingle", "file is too big");
        return res.status(413).send({
          message: "Le fichier téléversé dépasse la taille maximale autorisée.",
          name: "FileIsTooLargeError",
        });
      } else {
        log.w("uploadSingle", err);
        return res.status(400).send({ message: "Erreur inattendue." });
      }
    }
    next();
  });
}

router.get("/:uuid", checkJWT, documentsController.download);
router.get(
  "/admin/:uuid",
  boCheckJWT,
  checkPermissionBoToDownload,
  documentsController.adminDownload,
);
router.get("/admin/static/:name", boCheckJWT, documentsController.getStatic);
router.get("/public/:name", documentsController.getPublic);
router.post("/", checkJWT, uploadFile, scanFile, documentsController.upload);

module.exports = router;
