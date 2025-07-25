// src/components/KPIClientWrapper.tsx
'use client';

import React from 'react';

interface KPICardProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

export function KPICard({ children, href, className }: KPICardProps) {
  const handleClick = () => {
    window.open(href, '_blank');
  };

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
}