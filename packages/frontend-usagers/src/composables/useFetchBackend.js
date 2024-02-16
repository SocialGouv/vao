import { useRuntimeConfig, useFetch } from "#app";

export const useFetchBackend = (url, option = {}) => {
  const config = useRuntimeConfig();
  return useFetch(url, {
    baseURL: config.public.backendUrl,
    ...option,
  });
};
