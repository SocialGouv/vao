const express = require("express");

const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

const config = require("./config");
const routes = require("./routes");

const logger = require("./utils/logger");
const AppError = require("./utils/error");
const ValidationAppError = require("./utils/validation-error");

const log = logger(module.filename);

const whitelist = [
  config.frontUsagersDomain,
  config.frontBODomain,
  config.domain,
];
const corsOptions = {
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept",
  credentials: true,
  methods: "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
  origin(origin, callback) {
    log.d("cors", { origin, whitelist });
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AppError(`Not allowed by CORS`));
    }
  },
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
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
app.use(`/authentication`, routes.authentication);
app.use(`/users`, routes.user);
app.use(`/agrements`, routes.agrement);
app.use(`/organisme`, routes.organisme);
app.use(`/sejour`, routes.sejour);
app.use(`/hebergement`, routes.hebergement);
app.use(`/siret`, routes.siret);
app.use(`/documents`, routes.documents);
app.use(`/geo`, routes.geo);

app.use((req, res, next) => {
  next(new AppError(`Path "${req.url}" not found`, { statusCode: 404 }));
});

// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, next) => {
  log.w(err.name, err.message);

  if (!err.isOperational) {
    res.status(500).send("Une erreur inattendue est survenue");
    throw err;
  }

  if (err instanceof ValidationAppError) {
    return res.status(400).send({ code: err.name, errors: err.errors });
  }

  res
    .status(err.statusCode)
    .send(
      (err.name !== "Error" && { code: err.name }) || { message: err.message },
    );
});

module.exports = app;
