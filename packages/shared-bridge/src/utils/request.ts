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

export const hashToFormData = <T extends Record<string, unknown>>(
  hash: T,
): FormData => {
  const formData = new FormData();

  Object.entries(hash).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((arrayValue) => {
        formData.append(
          `${key}[]`,
          typeof arrayValue === "object" && arrayValue !== null
            ? JSON.stringify(arrayValue)
            : String(arrayValue),
        );
      });
    } else if (value instanceof Date) {
      formData.append(`${key}`, value.toISOString());
    } else if (value instanceof Blob || value instanceof File) {
      formData.append(`${key}`, value, "file");
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([hashKey, hashValue]) => {
        if (Array.isArray(hashValue)) {
          hashValue.forEach((arrayValue) => {
            formData.append(
              `${key}[${hashKey}][]`,
              typeof arrayValue === "object" && arrayValue !== null
                ? JSON.stringify(arrayValue)
                : String(arrayValue),
            );
          });
        } else {
          formData.append(`${key}[${hashKey}]`, String(hashValue));
        }
      });
    } else if (value !== undefined) {
      formData.append(`${key}`, String(value));
    }
  });
  return formData;
};
