import {
  FeatureFlagName,
  HebergementUsagersRoutesSchema,
} from "@vao/shared-bridge";
import express from "express";

import { statuts as HebergementStatuts } from "../../helpers/hebergement";
import checkJWT from "../../middlewares/checkJWT";
import checkPermissionHebergement from "../../middlewares/checkPermissionHebergement";
import checkPermissionHebergementUser from "../../middlewares/checkPermissionHebergementUser";
import checkStatutHebergement from "../../middlewares/checkStatutHebergement";
import {
  requestValidatorMiddleware,
  requestValidatorMiddlewareByFeatureFlag,
} from "../../middlewares/requestValidatorMiddleware";
import { HebergementUsagersController } from "./hebergement.controller";

const router = express.Router();

router.get("/", checkJWT, HebergementUsagersController.getList);

router.get("/siren/:siren", checkJWT, HebergementUsagersController.getBySiren);

router.get(
  "/:id",
  checkJWT,
  checkPermissionHebergement,
  requestValidatorMiddleware(HebergementUsagersRoutesSchema["GetOne"]),
  HebergementUsagersController.getOne,
);

router.post(
  "/",
  checkJWT,
  requestValidatorMiddlewareByFeatureFlag(
    HebergementUsagersRoutesSchema["Post"],
    FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
  ),
  HebergementUsagersController.post,
);

router.post(
  "/brouillon",
  checkJWT,
  requestValidatorMiddlewareByFeatureFlag(
    HebergementUsagersRoutesSchema["PostBrouillon"],
    FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
  ),
  HebergementUsagersController.postBrouillon,
);

router.put(
  "/:id/brouillon",
  checkJWT,
  requestValidatorMiddlewareByFeatureFlag(
    HebergementUsagersRoutesSchema["PutBrouillon"],
    FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
  ),
  checkStatutHebergement(HebergementStatuts.BROUILLON),
  HebergementUsagersController.updateBrouillon,
);

router.put(
  "/:id/activate",
  checkJWT,
  requestValidatorMiddlewareByFeatureFlag(
    HebergementUsagersRoutesSchema["PutActivate"],
    FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
  ),
  checkStatutHebergement(HebergementStatuts.BROUILLON),
  HebergementUsagersController.activate,
);

router.put(
  "/:id/desactivate",
  checkJWT,
  checkStatutHebergement(HebergementStatuts.ACTIF),
  checkPermissionHebergementUser,
  HebergementUsagersController.desactivate,
);

router.put(
  "/:id/reactivate",
  checkJWT,
  checkStatutHebergement(HebergementStatuts.DESACTIVE),
  checkPermissionHebergementUser,
  HebergementUsagersController.reactivate,
);

router.post(
  "/:id",
  checkJWT,
  requestValidatorMiddlewareByFeatureFlag(
    HebergementUsagersRoutesSchema["PostById"],
    FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
  ),
  checkStatutHebergement(HebergementStatuts.ACTIF),
  checkPermissionHebergement,
  HebergementUsagersController.update,
);

export default router;
