'use client';

import { useEffect, useState } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

export function ToastItem({ id, message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-accent-50 border-accent-200',
      text: 'text-accent-900',
      icon: 'text-accent-600',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
  }[type];

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={`${styles.bg} animate-slide-up flex items-center gap-3 rounded-xl border px-4 py-3 shadow-elevated backdrop-blur-sm`}
    >
      <Icon size={20} className={styles.icon} strokeWidth={2} />
      <span className={`flex-1 text-sm font-medium ${styles.text}`}>
        {message}
      </span>
      <button
        onClick={() => onClose(id)}
        className={`p-1 rounded-lg hover:bg-black/10 transition-colors duration-200 ${styles.text}`}
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

/**
 * Hook to manage toasts
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const close = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => show(message, 'success', duration);
  const error = (message: string, duration?: number) => show(message, 'error', duration);
  const info = (message: string, duration?: number) => show(message, 'info', duration);

  return { toasts, show, close, success, error, info };
}
