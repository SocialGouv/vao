export type ToastType = "info" | "success" | "warning" | "error";

export type ToastTitleTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  titleTag?: ToastTitleTag;
  type?: ToastType;
  small?: boolean;
  closed?: boolean;
  closeable?: boolean;
  closeButtonLabel?: string;
  duration?: number;
  role?: "alert" | "status";
  [key: string]: any;
}

export interface Toast extends ToastOptions {
  id: string;
  destroy: () => void;
  type: ToastType;
}
