'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { SocketProvider } from '@/contexts/SocketContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
};
