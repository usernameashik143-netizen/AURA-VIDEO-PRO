import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? XCircle
            : toast.type === 'warning'
            ? AlertCircle
            : Info;

        const borderCol =
          toast.type === 'success'
            ? 'border-emerald-500/30'
            : toast.type === 'error'
            ? 'border-rose-500/30'
            : toast.type === 'warning'
            ? 'border-amber-500/30'
            : 'border-indigo-500/30';

        const iconCol =
          toast.type === 'success'
            ? 'text-emerald-400'
            : toast.type === 'error'
            ? 'text-rose-400'
            : toast.type === 'warning'
            ? 'text-amber-400'
            : 'text-indigo-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl liquid-glass border ${borderCol} shadow-glass-md animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconCol}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-100">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
