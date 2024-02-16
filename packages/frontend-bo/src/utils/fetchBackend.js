import { useRuntimeConfig } from "#app";

export const $fetchBackend = (url, option = {}) => {
  const config = useRuntimeConfig();
  // eslint-disable-next-line no-undef
  return $fetch(url, {
    baseURL: config.public.backendUrl,
    ...option,
  });
};
