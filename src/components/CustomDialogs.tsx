import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const CustomToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-55 flex flex-col gap-2 w-full max-w-sm px-5 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
    info: <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300',
    info: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-300',
  };

  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-2xl border shadow-lg pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300 ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-xs font-bold leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 p-0.5 rounded-full hover:bg-black/5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
      <div className="absolute inset-0" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#faf9fe] dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in scale-in duration-200">
        <div className="flex items-center gap-2.5 text-amber-600 dark:text-[#ffbe5c] mb-3">
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          <h4 className="font-extrabold text-base text-[#1a1b1f] dark:text-zinc-100 tracking-tight">
            {title}
          </h4>
        </div>
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 bg-[#eeedf3] dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#1a1b1f] dark:text-zinc-200 font-bold rounded-xl text-xs transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 h-11 bg-[#006e28] hover:bg-[#00531c] text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#faf9fe] dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in scale-in duration-200">
        <div className="flex items-center gap-2.5 text-[#006e28] dark:text-[#53e16f] mb-3">
          <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          <h4 className="font-extrabold text-base text-[#1a1b1f] dark:text-zinc-100 tracking-tight">
            {title}
          </h4>
        </div>
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full h-11 bg-[#006e28] hover:bg-[#00531c] text-white font-bold rounded-xl text-xs shadow-md transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
};
