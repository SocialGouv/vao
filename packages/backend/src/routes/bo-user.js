const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const BOUserController = require("../controllers/bo-user");

// Renvoie la liste des utilisateurs du BO
router.get("/", BOcheckJWT, BOUserController.list);
// Gère une connexion via mot de passe.
router.get("/me", BOcheckJWT, BOUserController.getMe);
// Renvoie les informations liées à l'utilisateur
router.get("/:userId", BOcheckJWT, BOUserController.getOne);
// Création d'un utilisateur
router.post("/", BOcheckJWT, BOUserController.create);
// Mise à jour d'un utilisateur
router.post("/:userId", BOcheckJWT, BOUserController.update);

module.exports = router;
