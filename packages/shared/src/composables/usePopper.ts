import { onUnmounted, ref, watch, computed } from "vue";
import type { Ref } from "vue";

function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function observeElementSize(
  element: HTMLElement,
  callback: (element: HTMLElement, entry: ResizeObserverEntry) => void,
) {
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      callback(element, entry);
    }
  });

  resizeObserver.observe(element);

  return () => {
    resizeObserver.unobserve(element);
    resizeObserver.disconnect();
  };
}

function trackElementMovement(
  element: HTMLElement,
  callback: (element: HTMLElement) => void,
) {
  const updatePosition = () => {
    callback(element);
  };

  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition);

  updatePosition();

  return () => {
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition);
  };
}

function observeDomChanges(
  trackedElement: HTMLElement,
  element: HTMLElement,
  callback: (element: HTMLElement) => void,
) {
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" || mutation.type === "childList") {
        callback(element);
      }
    }
  });

  mutationObserver.observe(trackedElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  return () => {
    mutationObserver.disconnect();
  };
}

export function usePopper(host: Ref<null | HTMLElement>) {
  const hostSize = ref({ width: 0, height: 0 });
  const hostPosition = ref({ left: 0, top: 0 });
  const popoverPosition = computed(() => ({
    x: hostPosition.value.left,
    y: hostPosition.value.top + hostSize.value.height,
  }));
  const isElementVisible = ref(false);
  const activeTracking = ref(false);

  const observations: (() => void)[] = [];
  const stopObserving = () => {
    while (observations.length) {
      const observation = observations.pop();
      if (observation) {
        observation();
      }
    }
  };

  const setSize = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    if (
      rect.width !== hostSize.value.width ||
      rect.height !== hostSize.value.height
    ) {
      hostSize.value = { width: rect.width, height: rect.height };
    }
    if (
      rect.left + window.scrollX !== hostPosition.value.left ||
      rect.top + window.scrollY !== hostPosition.value.top
    ) {
      hostPosition.value = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    }
  };

  const debouncedSetSize = debounce(setSize, 100);

  watch(
    () => activeTracking.value || isElementVisible.value,
    (newValue) => {
      if (newValue) {
        track();
      } else {
        stopObserving();
      }
    },
  );

  const track = () => {
    if (host.value) {
      if (window.ResizeObserver) {
        new window.ResizeObserver(
          trackElementMovement(host.value, setSize),
        ).observe(host.value);
      }
      observations.push(observeElementSize(host.value, debouncedSetSize));
      observations.push(trackElementMovement(host.value, debouncedSetSize));
      observations.push(
        observeDomChanges(document.body, host.value, debouncedSetSize),
      );
    }
  };

  onUnmounted(() => {
    stopObserving();
  });

  return {
    activeTracking,
    hostSize,
    hostPosition,
    popoverPosition,
  };
}
