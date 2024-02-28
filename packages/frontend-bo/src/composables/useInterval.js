import { onMounted, onUnmounted } from "vue";

export const useInterval = (callback, time = 1000) => {
  let timer = null;

  onMounted(() => (timer = setInterval(callback, time)));
  onUnmounted(() => clearInterval(timer));
};
