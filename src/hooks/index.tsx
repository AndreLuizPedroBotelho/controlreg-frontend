import React from 'react';

import { AuthProvider } from './auth';
import { ModalProvider } from './modal';
import { ToastProvider } from './toast';

const AppProvider: React.FC = ({ children }) => (
  <AuthProvider>
    <ModalProvider>
      <ToastProvider>{children}</ToastProvider>
    </ModalProvider>
  </AuthProvider>
);

export default AppProvider;
