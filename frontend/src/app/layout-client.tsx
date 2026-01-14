'use client';

import { useState } from 'react';
import { ToastContainer, Toast } from '@/components/Toast';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </>
  );
}
