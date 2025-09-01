// src/lib/AppWrapper.tsx
"use client";

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import { DataProvider } from './DataProvider';
import { Toaster } from 'sonner';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <ClerkProvider
      localization={esES}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#2563eb',
          colorText: '#111827',
          colorBackground: '#ffffff',
          colorInputBackground: '#f9fafb',
          colorInputText: '#111827',
          colorSuccess: '#10b981',
          colorDanger: '#ef4444',
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        },
        elements: {
          formButtonPrimary: 
            'bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200',
          card: 'shadow-lg',
          headerTitle: 'text-2xl font-bold',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 
            'border border-gray-300 hover:bg-gray-50 transition-colors duration-200',
          socialButtonsBlockButtonText: 'font-medium',
          formFieldLabel: 'text-gray-700 font-medium',
          formFieldInput: 
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
        },
      }}
    >
      <DataProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </DataProvider>
    </ClerkProvider>
  );
};

export default AppWrapper;