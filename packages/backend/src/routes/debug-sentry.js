const Sentry = require("@sentry/node");
const express = require("express");
const Organisme = require("../services/Organisme");
const DemandeSejour = require("../services/DemandeSejour");

const router = express.Router();

router.get("/debug-sentry", async function mainHandler(req, res, next) {
  // always use try/catch in async functions and forward errors to next()
  // otherwise express with crash
  try {
    // add additional context to debug errors
    Sentry.setContext("context", { debug_status: true });

    // add external fetch api in trace
    const response = await fetch("https://www.google.com");
    Sentry.addBreadcrumb({
      data: { status: response.status },
      level: "error",
      message: "debug_help_in_trycatch",
    });

    // Add db calls in trace. Show traces and n+1 SQL problem
    const organismes = await Organisme.get();
    console.log(organismes.length);

    const demandesPromises = organismes.map((organisme) => {
      return DemandeSejour.get([organisme.organismeId]);
    });
    const demandesByOrganisme = await Promise.all(demandesPromises);
    Sentry.addBreadcrumb({
      data: {
        demandesByOrganisme: demandesByOrganisme.map((demandes, index) => {
          return {
            demandes: demandes.length,
            organisme: index,
          };
        }),
      },
      // message: "demandesByOrganisme",
    });

    throw new Error("Debug sentry error - before fixes");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
