'use client';

import { useEffect } from 'react';
import { clarity } from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'sqw7mnh9y7';

export default function ClarityScript() {
  useEffect(() => {
    // Initialize Clarity only once
    if (typeof window !== 'undefined' && !window.clarity) {
      clarity.init(CLARITY_PROJECT_ID);
    }
  }, []);

  return null;
}