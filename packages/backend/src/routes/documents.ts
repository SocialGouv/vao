import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";

import config from "../config";
import { documentsController } from "../controllers";
import boCheckJWT from "../middlewares/bo-check-JWT";
import checkJWT from "../middlewares/checkJWT";
import scanFile from "../middlewares/scan-file";
import logger from "../utils/logger";

const log = logger(module.filename);
const router = Router();

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
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

function uploadFile(req: Request, res: Response, next: NextFunction) {
  uploadSingle(req as any, res as any, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        log.w("uploadSingle", "file is too big");
        res.status(413).send({
          message: "Le fichier téléversé dépasse la taille maximale autorisée.",
          name: "FileIsTooLargeError",
        });
        return;
      }
      log.w("uploadSingle", err);
      res.status(400).send({ message: "Erreur inattendue." });
      return;
    }
    next();
  });
}

router.get("/:uuid", checkJWT, documentsController.download);
router.get("/admin/:uuid", boCheckJWT, documentsController.adminDownload);
router.get("/admin/static/:name", boCheckJWT, documentsController.getStatic);
router.get("/public/:name", documentsController.getPublic);
router.post("/", checkJWT, uploadFile, scanFile, documentsController.upload);
router.post(
  "/admin/",
  boCheckJWT,
  uploadFile,
  scanFile,
  documentsController.upload,
);

export default router;
