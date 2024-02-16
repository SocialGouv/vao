import { useRuntimeConfig } from "#app";

export const $fetchBackend = (url, option = {}) => {
  const { config } = useRuntimeConfig();
  return globalThis.$fetch(url, {
    ...option,
    credentials: "include",
    baseURL: option.baseUrl ?? config.public.backendUrl,
  });
};
