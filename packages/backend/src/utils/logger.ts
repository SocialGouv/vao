import $debug from "debug";
import path from "path";

const root = `${path.dirname(
  // @ts-expect-error - process.filename is not defined
  (require.main && require.main.filename) || process.filename,
)}/`;

export function logger(caller: string) {
  const names = caller.replace(root, "").split(".");
  if (names.length > 1) {
    names.pop();
  }
  const name = names.join();
  const debug = $debug(`debug:vao-backend/${name}`);
  const info = $debug(`info:vao-backend/${name}`);
  const warn = $debug(`warn:vao-backend/${name}`);
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
      // Raven.captureException(e)
    },
  };
}
