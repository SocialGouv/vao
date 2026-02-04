import { useRuntimeConfig } from "#app";
import type { BasicRoute } from "@vao/shared-bridge";
import { buildRequestPath, hashToFormData } from "@vao/shared-bridge";

export type FetchBackendOptions = Record<string, unknown>;

export const $fetchBackend = <T = any>(
  url: string,
  option: FetchBackendOptions = {},
): Promise<T> => {
  const config = useRuntimeConfig();
   
  return $fetch(url, {
    baseURL: config.public.backendUrl,
    ...option,
  }) as Promise<T>;
};

const OPTIONS_DEFAULT = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

export function buildRequest<Route extends BasicRoute>({
  params,
  body,
  path,
  method,
  query,
}: Omit<Route, "response">): () => Promise<Route["response"]> {
  const url = buildRequestPath(path, params);
  switch (method) {
    case "GET":
      return async () =>
        $fetchBackend<Route["response"]>(url, {
          ...OPTIONS_DEFAULT,
          method: "GET",
          params: {
            search: query,
          },
        });
    case "POST":
      return async () =>
        $fetchBackend<Route["response"]>(url, {
          ...OPTIONS_DEFAULT,
          method: "POST",
          body,
        });
    case "PUT":
      return async () =>
        $fetchBackend<Route["response"]>(url, {
          ...OPTIONS_DEFAULT,
          method: "PUT",
          body,
        });
    case "DELETE":
      return async () =>
        $fetchBackend<Route["response"]>(url, {
          ...OPTIONS_DEFAULT,
          method: "DELETE",
          body,
        });
    default:
      throw new Error("Method not supported");
  }
}

export function buildRequestFile<Route extends BasicRoute>({
  params,
  body,
  path,
  method,
  file,
}: Omit<Route, "response"> & { file: File }): () => Promise<Route["response"]> {
  const url = buildRequestPath(path, params);
  const formData = body ? hashToFormData(body) : new FormData();
  formData.append("file", file, file.name);
  switch (method) {
    case "POST":
      return async () =>
        $fetchBackend(url, {
          ...OPTIONS_DEFAULT,
          headers: {},
          method: "POST",
          body,
        });
    default:
      throw new Error("Method not supported");
  }
}
