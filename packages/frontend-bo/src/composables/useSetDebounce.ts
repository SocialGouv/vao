export const useSetDebounce = (cb: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let isUnmounted = false;

  const debounce = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      if (!isUnmounted) {
        cb({ isUnmounted });
      }
    }, delay);
  };

  onUnmounted(() => {
    isUnmounted = true;
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  return debounce;
};
