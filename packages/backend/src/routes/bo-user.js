const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const BOcheckRole = require("../middlewares/bo-check-role.js");
const BOUserController = require("../controllers/bo-user");
const checkTerrForAccountCreation = require("../middlewares/bo-check-terr-for-account-creation");
const getDepartements = require("../middlewares/getDepartements");

const BOcheckRoleCompte = BOcheckRole(["Compte"]);

// Renvoie la liste des utilisateurs du BO
router.get("/", BOcheckJWT, BOcheckRoleCompte, BOUserController.list);
// Gère une connexion via mot de passe.
router.get("/me", BOcheckJWT, BOUserController.getMe);
// Renvoie les informations liées à l'utilisateur
router.get("/:userId", BOcheckJWT, BOcheckRoleCompte, BOUserController.getOne);
// Mise à jour de mes informations
router.post("/me", BOcheckJWT, BOUserController.updateMe);
// Création d'un utilisateur
router.post(
  "/",
  BOcheckJWT,
  BOcheckRoleCompte,
  getDepartements,
  checkTerrForAccountCreation,
  BOUserController.create,
);
// Mise à jour d'un utilisateur
router.post(
  "/:userId",
  BOcheckJWT,
  BOcheckRoleCompte,
  getDepartements,
  checkTerrForAccountCreation,
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
