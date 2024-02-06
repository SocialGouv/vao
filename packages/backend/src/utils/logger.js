const path = require("path");
const $debug = require("debug");

const root = `${path.dirname(
  (require.main && require.main.filename) || process.filename
)}/`;

function logger(caller) {
  let name = caller.replace(root, "").split(".");
  if (name.length > 1) {
    name.pop();
  }
  name = name.join();
  const debug = $debug(`debug:vao-backend/${name}`);
  const info = $debug(`info:vao-backend/${name}`);
  const warn = $debug(`warn:vao-backend/${name}`);
  return {
    d(message, ...args) {
      if (debug.enabled) {
        debug("[DEBUG]", message, ...args);
      }
    },
    i(message, ...args) {
      if (debug.enabled) {
        debug("[INFO]", message, ...args);
      } else if (info.enabled) {
        info("[INFO]", message);
      }
    },
    w(...args) {
      if (debug.enabled) {
        debug("[WARN]", ...args);
      } else if (info.enabled) {
        info("[WARN]", ...args);
      } else if (warn.enabled) {
        warn("[WARN]", ...args);
      }
      // Raven.captureException(e)
    },
  };
}

module.exports = logger;
