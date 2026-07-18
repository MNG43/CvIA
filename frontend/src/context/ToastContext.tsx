import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
  remove: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, remove }}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: number) => void;
}) {
  const colors: Record<ToastType, string> = {
    success: "bg-emerald-600 border-emerald-700",
    error: "bg-red-600 border-red-700",
    info: "bg-blue-600 border-blue-700",
    warning: "bg-amber-500 border-amber-600",
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type]} text-white rounded-lg shadow-lg px-4 py-3 text-sm font-medium animate-slide-up border-l-4 flex items-start justify-between gap-3`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-white/80 hover:text-white shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
