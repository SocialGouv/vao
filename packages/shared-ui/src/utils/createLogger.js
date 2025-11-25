import $debug from "debug";

const createLogger = (projectName) => (path) => {
  const debug = $debug(`debug:${projectName}/${path}`);
  const info = $debug(`info:${projectName}/${path}`);
  const warn = $debug(`warn:${projectName}/${path}`);
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
    },
  };
};

export default createLogger;
