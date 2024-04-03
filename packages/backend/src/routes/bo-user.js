const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const BOUserController = require("../controllers/bo-user");

// Gère une connexion via mot de passe.
router.get("/me", BOcheckJWT, BOUserController.getMe);
// Renvoie la liste des utilisateurs du BO
router.get("/list", BOcheckJWT, BOUserController.getList);
// Renvoie les informations liées à l'utilisateur
router.get("/user", BOcheckJWT, BOUserController.getUser);
// Mise à jour d'un l'utilisateur
router.post("/update", BOcheckJWT, BOUserController.updateUser);

module.exports = router;
