import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { ERRORS_COMMON, FunctionalException } from "@vao/shared-bridge";
// @ts-expect-error BodyParser is not typed
import bodyParser from "body-parser";
// @ts-expect-error CookieParser is not typed
import cookieParser from "cookie-parser";
// @ts-expect-error Cors is not typed
import cors, { type CorsOptions } from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import adminAgrementsRoute from "./admin/agrements/agrements.route";
import { config } from "./config";
import * as routes from "./routes";
import agrementsRoute from "./usagers/agrements/agrements.route";
import AppError from "./utils/error";
import { logger } from "./utils/logger";
import ValidationAppError from "./utils/validation-error";

if (config.sentry.enabled) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    ignoreTransactions: [/^GET \/$/],
    includeLocalVariables: true,
    integrations: [
      Sentry.requestDataIntegration({
        include: {
          cookies: false,
          user: {
            email: false,
          },
        },
      }),
      nodeProfilingIntegration(),
    ],
    profilesSampleRate: 1.0,
    release: config.sentry.release,
    tracesSampleRate: 1.0,
  });
}

const app = express();

const log = logger(module.filename);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "object-src": ["'none'"],
        "script-src": ["'self'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
  }),
);
app.use((_req, res, next) => {
  res.setHeader("X-XSS-Protection", "0");
  next();
});

const whitelist = [
  config.frontUsagersDomain,
  config.frontBODomain,
  config.domain,
];
const corsOptions: CorsOptions = {
  allowedHeaders:
    "Content-Type,Authorization,X-Requested-With,Accept,sentry-trace,baggage",
  credentials: true,
  methods: "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  origin(
    origin: string | undefined,
    // eslint-disable-next-line no-unused-vars
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
      return;
    }
    callback(new AppError(`Not allowed by CORS`));
  },
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cookieParser());

app.get("", (req, res) => {
  res.send("Bienvenue sur le server du portail Front");
});

app.use(`/bo-authentication`, routes.BOAuthentication);
app.use(`/bo-user`, routes.BOUser);
app.use(`/fo-user`, routes.FOUser);
app.use(`/authentication`, routes.authentication);
app.use(`/users`, routes.user);
app.use(`/agrements`, agrementsRoute);
app.use(`/admin/agrements`, adminAgrementsRoute);

app.use(`/organisme`, routes.organisme);
app.use(`/sejour`, routes.sejour);
app.use(`/hebergement`, routes.hebergement);
app.use(`/siret`, routes.siret);
app.use(`/documents`, routes.documents);
app.use(`/geo`, routes.geo);
app.use(`/eig`, routes.eig);
app.use(`/message`, routes.message);
app.use(`/territoire`, routes.territoire);
app.use(`/healthz`, routes.healthz);

if (config.sentry.environment !== "production") {
  app.use("/", routes.debugSentry);
  app.use(`/e2e`, routes.e2e);
}

app.use((req, res, next) => {
  next(
    new AppError(`Path "${req.url}" not found`, {
      name: ERRORS_COMMON.PATH_NOT_FOUND,
      statusCode: 404,
    }),
  );
});

if (config.sentry.enabled) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(
  async (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const name = err instanceof Error ? err.name : "Error";
    const message = err instanceof Error ? err.message : String(err);
    log.w(name, message);

    if (res.headersSent) {
      next(err);
      return;
    }

    if (err instanceof FunctionalException) {
      res.status(422).send({
        code: err.code,
        detail: err.detail,
        name: err.name,
      });
      return;
    }

    const isOperational = err instanceof AppError ? err.isOperational : false;
    if (!isOperational) {
      res.status(500).send({
        name: "UnexpectedError",
      });
      return;
    }

    if (err instanceof ValidationAppError) {
      res.status(400).send({ errors: err.errors, name: err.name });
      return;
    }

    if (err instanceof AppError) {
      res.status(err.statusCode).send({
        message: err.message,
        name: err.name,
      });
      return;
    }

    res.status(500).send({
      name: "UnexpectedError",
    });
  },
);

export default app;
