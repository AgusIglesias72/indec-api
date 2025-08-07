'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function ClarityScript() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    // Only initialize if we have a project ID
    if (!projectId) {
      console.warn('Clarity Project ID not found in environment variables');
      return;
    }

    // Initialize Clarity only once
    if (typeof window !== 'undefined' && !window.clarity) {
      Clarity.init(projectId);
      
      // Optional: Log initialization in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Microsoft Clarity initialized with project ID:', projectId);
      }
    }
  }, []);

  return null;
}