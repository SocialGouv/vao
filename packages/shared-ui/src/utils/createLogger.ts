import $debug from "debug";

export default function createLogger(projectName: string) {
  return (path: string) => {
    const debug = $debug(`debug:${projectName}/${path}`);
    const info = $debug(`info:${projectName}/${path}`);
    const warn = $debug(`warn:${projectName}/${path}`);
    return {
      d(message: string, ...args: any[]) {
        if (debug.enabled) {
          debug("[DEBUG]", message, ...args);
        }
      },
      i(message: string, ...args: any[]) {
        if (debug.enabled) {
          debug("[INFO]", message, ...args);
        } else if (info.enabled) {
          info("[INFO]", message);
        }
      },
      w(...args: any[]) {
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
}
