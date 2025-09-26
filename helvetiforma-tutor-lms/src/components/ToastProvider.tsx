'use client';

import { ToastContainer, useToasts } from '@/components/Toast';

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToasts();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
