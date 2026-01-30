import { reactive } from "vue";
import type { Toast, ToastOptions, ToastType } from "../types/toaster.type";

const toasts = reactive<Toast[]>([]);

function addToast(options: ToastOptions, type: ToastType): Toast {
  const id = options.id ?? Math.random().toString(36).slice(2);
  const toast: Toast = {
    ...options,
    id,
    destroy() {
      const idx = toasts.findIndex((t) => t.id === id);
      if (idx !== -1) toasts.splice(idx, 1);
    },
    type,
  };
  toasts.push(toast);

  if (options.duration && options.duration > 0) {
    setTimeout(() => toast.destroy(), options.duration);
  }

  return toast;
}

export function useToaster() {
  return {
    toasts,
    success: (options: ToastOptions) => addToast(options, "success"),
    error: (options: ToastOptions) => addToast(options, "error"),
    info: (options: ToastOptions) => addToast(options, "info"),
    warning: (options: ToastOptions) => addToast(options, "warning"),
    destroyAll: () => {
      toasts.splice(0, toasts.length);
    },
  };
}
