const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const BOcheckRole = require("../middlewares/bo-check-role.js");
const BOUserController = require("../controllers/bo-user");

const BOcheckRoleCompte = BOcheckRole("Compte");

// Renvoie la liste des utilisateurs du BO
router.get("/", BOcheckJWT, BOcheckRoleCompte, BOUserController.list);
// Gère une connexion via mot de passe.
router.get("/me", BOcheckJWT, BOUserController.getMe);
// Renvoie les informations liées à l'utilisateur
router.get("/:userId", BOcheckJWT, BOcheckRoleCompte, BOUserController.getOne);
// Création d'un utilisateur
router.post("/", BOcheckJWT, BOcheckRoleCompte, BOUserController.create);
// Mise à jour d'un utilisateur
router.post("/:userId", BOcheckJWT, BOcheckRoleCompte, BOUserController.update);

module.exports = router;
