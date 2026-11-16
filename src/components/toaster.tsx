"use client";

import { useEffect, useState } from "react";

type ToastAction = {
  label: string;
  run: () => void | Promise<void>;
};

type Toast = {
  id: number;
  message: string;
  action?: ToastAction;
};

let publish: ((toast: Toast) => void) | null = null;

export function showToast(message: string, action?: ToastAction) {
  publish?.({ id: Date.now() + Math.random(), message, action });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    publish = (toast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 6000);
    };
    return () => {
      publish = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id} role="status">
          <p>{toast.message}</p>
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                void toast.action?.run();
                setToasts((current) => current.filter((item) => item.id !== toast.id));
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
