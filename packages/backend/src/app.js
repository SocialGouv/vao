const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

const config = require("./config");

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

const express = require("express");
const helmet = require("helmet");

const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

const routes = require("./routes");

const logger = require("./utils/logger");
const AppError = require("./utils/error");
const ValidationAppError = require("./utils/validation-error");

const log = logger(module.filename);

app.use(helmet());

const whitelist = [
  config.frontUsagersDomain,
  config.frontBODomain,
  config.domain,
];
const corsOptions = {
  allowedHeaders:
    "Content-Type,Authorization,X-Requested-With,Accept,sentry-trace,baggage",
  credentials: true,
  methods: "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  origin(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AppError(`Not allowed by CORS`));
    }
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
app.use(`/agrements`, routes.agrement);
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
}

app.use((req, res, next) => {
  next(
    new AppError(`Path "${req.url}" not found`, {
      name: "PATH_NOT_FOUND",
      statusCode: 404,
    }),
  );
});

if (config.sentry.enabled) {
  Sentry.setupExpressErrorHandler(app);
}

// eslint-disable-next-line no-unused-vars
app.use(async function errorHandler(err, req, res, next) {
  log.w(err.name, err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (!err.isOperational) {
    res.status(500).send({
      name: "UnexpectedError",
    });
    return;
  }

  if (err instanceof ValidationAppError) {
    return res.status(400).send({ errors: err.errors, name: err.name });
  }

  res
    .status(err.statusCode)
    .send(
      (err.name !== "Error" && { name: err.name }) || { message: err.message },
    );
});

module.exports = app;
