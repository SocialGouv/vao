import type { BasicRoute } from "../routes";

export function buildRequestPath(
  path: BasicRoute["path"],
  params: BasicRoute["params"],
): string {
  let finalPath = path;
  if (params && Object.keys(params).length > 0) {
    for (const paramKey in params) {
      const value = params[paramKey];
      if (value === null || value === undefined) {
        finalPath = finalPath.replace(`{${paramKey}}`, "");
        finalPath = finalPath.replace(`{${paramKey}?}`, "");
      } else {
        finalPath = finalPath.replace(`{${paramKey}}`, `${value}`);
        finalPath = finalPath.replace(`{${paramKey}?}`, `${value}`);
      }
    }
  }
  // Remove optionnal params if they are not filled
  finalPath = finalPath.replace(/\/\{[a-zA-Z0-9]+\?\}/g, "");

  return finalPath;
}
