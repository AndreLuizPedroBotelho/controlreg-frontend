import React, { createContext, useCallback, useState, useContext } from 'react';
import { FormHandles } from '@unform/core';

interface ModalContextData {
  openModal(): void;
  closeModal(): void;
  open: boolean;
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData);

const ModalProvider: React.FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ModalContext.Provider value={{ open, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

function useModal(): ModalContextData {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
}

export { ModalProvider, useModal };
