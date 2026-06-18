import { TRACKING_ACTIONS, TRACKING_USER_TYPE } from "@vao/shared-bridge";
import express from "express";

import { BOUserController } from "../controllers";
import BOcheckJWT from "../middlewares/bo-check-JWT";
import BOcheckJWTWithoutCGU from "../middlewares/bo-check-JWT-without-CGU";
import BOcheckRole from "../middlewares/bo-check-role";
import checkTerrForAccountCreation from "../middlewares/bo-check-terr-for-account-creation";
import getDepartements from "../middlewares/getDepartements";
import trackBoUser from "../middlewares/trackBoUser";

const router = express.Router();

const BOcheckRoleCompte = BOcheckRole(["Compte"]);
// Acceptation des CGU
router.post("/accept-cgu", BOcheckJWTWithoutCGU, BOUserController.acceptCgu);

// Renvoie la liste des utilisateurs du BO
router.get("/", BOcheckJWT, BOcheckRoleCompte, BOUserController.list);
router.get(
  "/extract",
  BOcheckJWT,
  BOcheckRoleCompte,
  BOUserController.getExtract,
);
// Gère une connexion via mot de passe.
router.get("/me", BOcheckJWT, BOUserController.getMe);
// Liste des utilisateurs BO Liés à un territoire et sous territoires
router.get(
  "/territoires/:territoireCode",
  BOcheckJWT,
  BOUserController.listUsersTerritoire,
);
// Renvoie les informations liées à l'utilisateur
router.get("/:userId", BOcheckJWT, BOcheckRoleCompte, BOUserController.getOne);
// Mise à jour de mes informations
router.post(
  "/me",
  BOcheckJWT,
  trackBoUser({
    action: TRACKING_ACTIONS.modification,
    itself: true,
    userType: TRACKING_USER_TYPE.back,
  }),
  BOUserController.updateMe,
);
// Création d'un utilisateur
router.post(
  "/",
  BOcheckJWT,
  BOcheckRoleCompte,
  getDepartements,
  checkTerrForAccountCreation,
  trackBoUser({
    action: TRACKING_ACTIONS.creation,
    userType: TRACKING_USER_TYPE.back,
  }),
  BOUserController.create,
);
// Mise à jour d'un utilisateur
router.post(
  "/:userId",
  BOcheckJWT,
  BOcheckRoleCompte,
  getDepartements,
  checkTerrForAccountCreation,
  trackBoUser({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.back,
  }),
  BOUserController.update,
);
// Fonctione transverse de recherche du service compétent
router.get(
  "/:territoireCode",
  BOcheckJWT,
  BOcheckRoleCompte,
  BOUserController.serviceCompetence,
);

export default router;
