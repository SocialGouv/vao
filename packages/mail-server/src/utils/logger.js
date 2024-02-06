const path = require("path");
const debug = require("debug");

const root = `${path.dirname(
  (require.main && require.main.filename) || process.filename
)}/`;

const logger = function (caller) {
  let name = caller.replace(root, "").split(".");
  if (name.length > 1) {
    name.pop();
  }
  name = name.join(".");
  const debugLevel = debug(`debug:mail-server/${name}`);
  const info = debug(`info:mail-server/${name}`);
  const warn = debug(`warn:mail-server/${name}`);
  return {
    d(message, ...args) {
      if (debugLevel.enabled) {
        debugLevel("[DEBUG]", message, ...args);
      }
    },
    i(message, ...args) {
      if (debugLevel.enabled) {
        debugLevel("[INFO]", message, ...args);
      } else if (info.enabled) {
        info("[INFO]", message);
      }
    },
    w(...args) {
      if (debugLevel.enabled) {
        debugLevel("[WARN]", ...args);
      } else if (info.enabled) {
        info("[WARN]", ...args);
      } else if (warn.enabled) {
        warn("[WARN]", ...args);
      }
      // Raven.captureException(e)
    },
  };
};

module.exports = logger;
