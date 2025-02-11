const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const BOcheckRole = require("../middlewares/bo-check-role.js");
const BOUserController = require("../controllers/bo-user");
const checkTerrForAccountCreation = require("../middlewares/bo-check-terr-for-account-creation");
const getDepartements = require("../middlewares/getDepartements");
const trackBoUser = require("../middlewares/trackBoUser");

const { actions, userTypes } = require("../helpers/tracking");

const BOcheckRoleCompte = BOcheckRole(["Compte"]);

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
    action: actions.modification,
    itself: true,
    userType: userTypes.back,
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
  trackBoUser({ action: actions.creation, userType: userTypes.back }),
  BOUserController.create,
);
// Mise à jour d'un utilisateur
router.post(
  "/:userId",
  BOcheckJWT,
  BOcheckRoleCompte,
  getDepartements,
  checkTerrForAccountCreation,
  trackBoUser({ action: actions.modification, userType: userTypes.back }),
  BOUserController.update,
);
// Fonctione transverse de recherche du service compétent
router.get(
  "/:territoireCode",
  BOcheckJWT,
  BOcheckRoleCompte,
  BOUserController.serviceCompetence,
);

module.exports = router;
