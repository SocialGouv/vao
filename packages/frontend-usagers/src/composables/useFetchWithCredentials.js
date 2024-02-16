import { useRuntimeConfig, useFetch } from "#app";

export const useFetchWithCredentials = async (url, option = {}) => {
  const config = useRuntimeConfig();
  return useFetch(url, {
    baseURL: config.public.backendUrl,
    credentials: "include",
    ...option,
  });
};
