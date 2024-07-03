import { reactive } from "vue";

export const useIsDownloading = () => {
  const apiStatus = reactive({
    isDownloading: false,
    message: null,
  });
  const resetApiStatut = () => {
    apiStatus.isDownloading = false;
    apiStatus.message = null;
  };

  const setApiStatut = (message) => {
    apiStatus.isDownloading = true;
    apiStatus.message = message;
  };

  return { apiStatus, resetApiStatut, setApiStatut };
};
