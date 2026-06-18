import { reactive } from "vue";

export const useIsDownloading = () => {
  const apiStatus = reactive<{
    isDownloading: boolean;
    message: string | undefined;
  }>({
    isDownloading: false,
    message: null as unknown as string | undefined,
  });
  const resetApiStatut = () => {
    apiStatus.isDownloading = false;
    apiStatus.message = null as unknown as string | undefined;
  };

  const setApiStatut = (message: string) => {
    apiStatus.isDownloading = true;
    apiStatus.message = message;
  };

  return { apiStatus, resetApiStatut, setApiStatut };
};
