const Sentry = require("@sentry/node");
const express = require("express");
const Organisme = require("../services/Organisme");
const DemandeSejour = require("../services/DemandeSejour");

const router = express.Router();

router.get("/debug-sentry", async function mainHandler(req, res, next) {
  try {
    const response = await fetch("https://www.google.com");

    const organismes = await Organisme.get();
    const demandesPromises = organismes.map((organisme) => {
      return DemandeSejour.get([organisme.organismeId]);
    });
    const demandesByOrganisme = await Promise.all(demandesPromises);

    throw new Error("Debug sentry error - before fixes");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
