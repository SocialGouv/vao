import * as Sentry from "@sentry/node";
import axios from "axios";
import { NextFunction, Request, Response, Router } from "express";

import * as DemandeSejour from "../services/DemandeSejour";
import * as Organisme from "../services/Organisme";

const router = Router();

router.get("/debug-sentry", (req, res, next) => {
  Sentry.startNewTrace(async () => {
    await Sentry.startSpan(
      {
        name: `Profile ${req.method} ${req.baseUrl}${req.path}`,
        op: "http",
      },
      async () => {
        await mainHandler(req, res, next);
      },
    );
  });
});

async function mainHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // always use try/catch in async functions and forward errors to next()
  // otherwise express with crash
  try {
    // add additional context to debug errors
    Sentry.setContext("context", { debug_status: true });

    // add external axios api in trace
    const response = await axios.get("https://www.google.com");
    Sentry.addBreadcrumb({
      data: { status: response.status },
      level: "error",
      message: "debug_help_in_trycatch",
    });

    // Add db calls in trace. Show traces and n+1 SQL problem
    const { rows: organismes } = await Organisme.getListe({});

    const demandesPromises = organismes.map((organisme: any) => {
      return DemandeSejour.get([organisme.organismeId]);
    });
    const demandesByOrganisme = await Promise.all(demandesPromises);
    Sentry.addBreadcrumb({
      data: {
        demandesByOrganisme: demandesByOrganisme.map((demandes, index) => {
          return {
            // @ts-expect-error TODO: fix this
            demandes: demandes.length,
            organisme: index,
          };
        }),
      },
    });

    throw new Error("Debug sentry error - before fixes");
  } catch (err) {
    next(err);
  }
}

export default router;
