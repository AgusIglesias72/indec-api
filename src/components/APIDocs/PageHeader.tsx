// src/components/APIDocs/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  );
}