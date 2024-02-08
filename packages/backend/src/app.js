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

const whitelist = [config.frontUsagersDomain, config.frontBODomain];
const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
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

app.use(`/authentication`, routes.authentication);
app.use(`/users`, routes.user);
app.use(`/document`, routes.document);
app.use(`/operateurs`, routes.operateurs);
app.use(`/sejour`, routes.sejour);
app.use(`/hebergement`, routes.hebergement);
app.use(`/siret`, routes.siret);
app.use(`/geo`, routes.geo);
app.use("/referentiel", routes.referentiel);

app.use((req, res, next) => {
  next(new AppError(`Path "${req.url}" not found`, { statusCode: 404 }));
});

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
