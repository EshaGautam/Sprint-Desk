import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  isVisible,
  onDismiss,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  const bgTypes = {
    info: 'bg-zinc-900 border-zinc-800 text-zinc-100 dark:bg-zinc-950 dark:border-zinc-800',
    success: 'bg-emerald-950/90 border-emerald-800 text-emerald-200',
    warning: 'bg-amber-950/90 border-amber-800 text-amber-200',
    error: 'bg-red-950/90 border-red-800 text-red-200',
  };

  const icons = {
    info: (
      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 max-w-sm ${bgTypes[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
