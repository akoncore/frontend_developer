import { createContext, useContext, useState } from "react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type, id: Date.now() });
  }

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && (
        <div key={toast.id} role="status" className={`toast ${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "!"}</span>
          {toast.message}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
