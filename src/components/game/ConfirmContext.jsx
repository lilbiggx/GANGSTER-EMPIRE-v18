import React, { createContext, useContext, useState } from "react";
import { ConfirmModal } from "./ui";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalConfig, setModalConfig] = useState(null);

  const confirmAction = (title, message, onConfirm) => {
    setModalConfig({
      title,
      message,
      onConfirm: () => {
        setModalConfig(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => setModalConfig(null),
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirmAction }}>
      {children}
      <ConfirmModal
        open={Boolean(modalConfig)}
        title={modalConfig?.title}
        message={modalConfig?.message}
        onConfirm={modalConfig?.onConfirm}
        onCancel={modalConfig?.onCancel}
      />
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
