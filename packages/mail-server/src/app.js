const express = require("express");
const bodyParser = require("body-parser");

const { errorHandler } = require("./utils/error");
const logger = require("./utils/logger");

const routers = require("./routers");

const log = logger(module.filename);

let connection;

const defineRoutes = (expressApp) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    res.json({ message: "mail-server is running here !" });
  });

  router.use("/mail", routers.mail);

  expressApp.use("/api", router);

  expressApp.use(async (error, req, res, next) => {
    log.w(error.name, error.message);

    if (typeof error === "object") {
      if (error.isTrusted === undefined || error.isTrusted === null) {
        error.isTrusted = true; // Error during a specific request is usually not catastrophic and should not lead to process exit
      }
    }
    await errorHandler(error);

    res.status(error.statusCode ?? 500).send({
      message: error.message,
      ...((error.name !== "Error" && { code: error.name }) || {}),
    });
  });
};

const initializeWebServer = async () => {
  // A typical Express setup
  log.i("Web server is starting");
  const expressApp = express();
  expressApp.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  expressApp.use(bodyParser.json());
  defineRoutes(expressApp);
  const webServerPort = process.env.PORT ? process.env.PORT : null;
  connection = await expressApp.listen(webServerPort);
  log.i("Web server is started");
  return connection.address();
};

const stopWebServer = async () => {
  log.i("Web server is stopping");
  await connection.close();
  log.i("Web server stopped");
};

process.on("uncaughtException", (error) => {
  console.log("uncaughtException");
  errorHandler.handleError(error);
});

process.on("unhandledRejection", (reason) => {
  console.log("unhandledRejection");
  errorHandler.handleError(reason);
});

module.exports = {
  initializeWebServer,
  stopWebServer,
};
