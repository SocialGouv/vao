import { useRuntimeConfig, useFetch } from "#app";

export const useFetchWithCredentials = async (url, option = {}) => {
  const config = useRuntimeConfig();
  return useFetch(url, {
    ...option,
    credentials: "include",
    baseURL: option.baseUrl ?? config.public.backendUrl,
  });
};
