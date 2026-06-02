import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error';

type ToastContextValue = {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');

  const showToast = (nextMessage: string, nextType: ToastType) => {
    setMessage(nextMessage);
    setType(nextType);
    setOpen(true);
  };

  const hideToast = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOpen(false);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open]);

  const value = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast open={open} type={type} message={message} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
