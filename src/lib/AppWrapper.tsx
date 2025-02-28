// src/lib/AppWrapper.tsx
import React from 'react';
import { DataProvider } from './DataProvider';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
};

export default AppWrapper;