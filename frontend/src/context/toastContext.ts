import { createContext } from 'react';

export type ToastType = 'success' | 'error';

export type ToastContextValue = {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
