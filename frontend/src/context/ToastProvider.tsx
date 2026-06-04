import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Toast from '../components/Toast';
import { ToastContext, type ToastType } from './toastContext';

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
