import { useRuntimeConfig, useFetch } from "#app";

export const useFetchWithCredentials = async (
  url,
  option = null,
  baseUrl = null,
) => {
  const config = useRuntimeConfig();
  return useFetch(url, {
    ...(option ?? {}),
    credentials: "include",
    baseURL: baseUrl ?? config.public.backendUrl,
  });
};
