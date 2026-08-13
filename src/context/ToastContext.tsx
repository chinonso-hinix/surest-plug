import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Limit max 5 visible toasts at once

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'success', title || 'Success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'error', title || 'Error', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'info', title || 'Notice', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'warning', title || 'Attention', duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        removeToast,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: {
              bg: 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/30',
              iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
              Icon: CheckCircle2,
              titleColor: 'text-emerald-400',
              accentLine: 'bg-emerald-500',
            },
            error: {
              bg: 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/30',
              iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
              Icon: XCircle,
              titleColor: 'text-rose-400',
              accentLine: 'bg-rose-500',
            },
            warning: {
              bg: 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/30',
              iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
              Icon: AlertTriangle,
              titleColor: 'text-amber-400',
              accentLine: 'bg-amber-500',
            },
            info: {
              bg: 'bg-slate-900/95 border-blue-500/40 text-slate-100 shadow-blue-950/30',
              iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
              Icon: Info,
              titleColor: 'text-blue-400',
              accentLine: 'bg-blue-500',
            },
          }[toast.type];

          const IconComponent = typeStyles.Icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-out animate-in slide-in-from-top-3 fade-in ${typeStyles.bg}`}
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${typeStyles.accentLine}`} />

              <div className="flex items-start space-x-3 pl-1">
                <div className={`p-2 rounded-lg shrink-0 ${typeStyles.iconBg}`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="flex-1 pr-2 pt-0.5">
                  {toast.title && (
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${typeStyles.titleColor}`}>
                      {toast.title}
                    </h4>
                  )}
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
