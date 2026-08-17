import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react";
import { useToast } from "../context/ToastContext";
import type { ToastType } from "../context/ToastContext";

const toastStyles: Record<
  ToastType,
  { wrapper: string; icon: string; bar: string }
> = {
  success: {
    wrapper: "bg-green-50 border border-green-200 text-green-800",
    icon: "text-green-500",
    bar: "bg-green-400",
  },
  warning: {
    wrapper: "bg-amber-50 border border-amber-200 text-amber-800",
    icon: "text-amber-500",
    bar: "bg-amber-400",
  },
  error: {
    wrapper: "bg-red-50 border border-red-200 text-red-800",
    icon: "text-red-500",
    bar: "bg-red-400",
  },
  info: {
    wrapper: "bg-blue-50 border border-blue-200 text-blue-800",
    icon: "text-blue-500",
    bar: "bg-blue-400",
  },
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  const cls = `w-5 h-5 flex-shrink-0 ${toastStyles[type].icon}`;
  switch (type) {
    case "success":
      return <CheckCircle2 className={cls} />;
    case "warning":
      return <AlertCircle className={cls} />;
    case "error":
      return <XCircle className={cls} />;
    case "info":
      return <Info className={cls} />;
  }
};

export const Toaster = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-progress {
          animation: shrink 4000ms linear forwards;
        }
        .toast-enter {
          animation: toastIn 200ms ease-out forwards;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const styles = toastStyles[toast.type];
          return (
            <div
              key={toast.id}
              className={`toast-enter pointer-events-auto relative flex items-start gap-3 rounded-xl shadow-lg px-4 py-3 pr-10 min-w-70 max-w-sm overflow-hidden ${styles.wrapper}`}
            >
              {/* Icon */}
              <div className="mt-0.5">
                <ToastIcon type={toast.type} />
              </div>

              {/* Message */}
              <p className="text-sm font-medium leading-snug flex-1">
                {toast.message}
              </p>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-2.5 right-2.5 opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-black/5">
                <div className={`toast-progress h-full ${styles.bar}`} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Toaster;
